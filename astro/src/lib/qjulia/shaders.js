// GLSL for the quaternion Julia set. One full-screen triangle; every pixel
// ray-marches the set with a distance estimator. No meshes, no assets.
//
// The object: every quaternion q whose orbit under q -> q^2 + c stays
// bounded, cut by a hyperplane so it can be seen in 3D. By default the
// hyperplane is k = uSlice and (x, y, z) are the (1, i, j) components of q;
// uRot turns that hyperplane through four dimensions.

export const VERT = `#version 300 es
in vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

export const RENDER_FRAG = `#version 300 es
precision highp float;
precision highp int;

uniform vec2  uRes;        // render-target size, px
uniform vec4  uC;          // Julia constant (1, i, j, k)
uniform float uSlice;      // k component of the 3D slice
uniform float uBound;      // radius of a sphere that contains the set
uniform int   uIter;       // orbit iterations for the distance estimate
uniform int   uSteps;      // ray-march step cap
uniform float uDetail;     // hit threshold in pixel footprints
uniform vec3  uCamPos;
uniform vec3  uCamRight;
uniform vec3  uCamUp;
uniform vec3  uCamFwd;
uniform float uTanHalfFov; // vertical
uniform vec2  uJitter;     // sub-pixel offset, px
uniform vec2  uShift;      // moves the subject off-centre, in half-heights
uniform vec2  uLens;       // lens offset in world units (0 = pinhole)
uniform float uFocusDist;
uniform int   uAOStride;   // 1 = all five occlusion probes, 2 = three of them
uniform int   uShadowSteps;
uniform float uShadowMinStep;
uniform vec3  uKeyDir;     // toward the key light, world space
uniform vec3  uFillDir;    // toward the fill light, world space
uniform vec3  uBg;         // paper, linear
uniform float uHaze;       // aerial falloff toward the paper with distance
uniform mat4  uRot;        // turns the slicing hyperplane through 4D
uniform float uNear;       // camera-side cut: solid nearer than this shows its cross-section
uniform vec4  uClip;       // cut plane: keeps dot(xyz, p) <= w; w >= 99 is off
uniform float uFish;       // 0 rectilinear .. 1 equidistant fisheye
uniform float uOrtho;      // 0 perspective .. 1 orthographic

out vec4 fragColor;

vec4 qsqr(vec4 a) {
  return vec4(a.x * a.x - dot(a.yzw, a.yzw), 2.0 * a.x * a.yzw);
}

// A point of 3D space as a quaternion on the (possibly turned) hyperplane.
vec4 lift(vec3 p) { return uRot * vec4(p, uSlice); }

// Hart, Sandin & Kauffman (1989): distance <= 0.5 |z| log|z| / |z'|.
// |z'| is tracked through |z'_{n+1}| = 2 |z_n| |z'_n|.
float de(vec3 p, out vec4 trap) {
  vec4 z = lift(p);
  float md2 = 1.0;
  float mz2 = dot(z, z);
  trap = vec4(abs(z.yzw), mz2);
  for (int i = 0; i < 64; i++) {
    if (i >= uIter) break;
    md2 *= 4.0 * mz2;
    z = qsqr(z) + uC;
    mz2 = dot(z, z);
    trap = min(trap, vec4(abs(z.yzw), mz2));
    if (mz2 > 256.0) break;
  }
  return 0.25 * sqrt(mz2 / md2) * log(mz2);
}

float deOnly(vec3 p) { vec4 t; return de(p, t); }

// Analytic normal: the gradient of |z_n|^2 is J^T z_n, where J is the
// orbit's Jacobian. Each step's Jacobian (up to a factor 2) is
// [x -y -z -w; y x 0 0; z 0 x 0; w 0 0 x]; GLSL's column-major constructor
// below builds its transpose, so J * M accumulates J^T directly.
vec3 calcNormal(vec3 p) {
  vec4 z = lift(p);
  mat4 J = mat4(1.0);
  for (int i = 0; i < 64; i++) {
    if (i >= uIter) break;
    J = J * mat4(z.x, -z.y, -z.z, -z.w,
                 z.y,  z.x,  0.0,  0.0,
                 z.z,  0.0,  z.x,  0.0,
                 z.w,  0.0,  0.0,  z.x);
    z = qsqr(z) + uC;
    if (dot(z, z) > 256.0) break;
  }
  // q = R (p, s), so the gradient in p is the first three rows of R^T grad_q.
  return normalize((transpose(uRot) * (J * z)).xyz);
}

// Whether p lies in the filled set (its orbit stays bounded), and how close
// that orbit came to the origin, which patterns a cut face.
bool insideSet(vec3 p, out float trap) {
  vec4 z = lift(p);
  trap = 1e9;
  for (int i = 0; i < 64; i++) {
    if (i >= uIter) break;
    z = qsqr(z) + uC;
    float m = dot(z, z);
    trap = min(trap, m);
    if (m > 256.0) return false;
  }
  return true;
}

vec2 sphereHit(vec3 ro, vec3 rd, float r) {
  float b = dot(ro, rd);
  float c = dot(ro, ro) - r * r;
  float h = b * b - c;
  if (h < 0.0) return vec2(-1.0);
  h = sqrt(h);
  return vec2(-b - h, -b + h);
}

// Hit distance along the ray, or -1. face: 0 = the set's surface, 1 = the
// camera-side cut through the solid, 2 = the cut plane. A cut face shows the
// solid's cross-section, patterned by ftrap.
float march(vec3 ro, vec3 rd, float pix0, float pixK, out vec4 trap, out int face, out float ftrap) {
  face = 0;
  ftrap = 1.0;
  vec2 bs = sphereHit(ro, rd, uBound);
  if (bs.y < 0.0) return -1.0;
  float t0 = max(bs.x, 0.0), t1 = bs.y;
  bool cut = false, onPlane = false;
  if (uNear > t0) { t0 = uNear; cut = true; }
  if (uClip.w < 99.0) {
    float dn = dot(uClip.xyz, rd), dp = dot(uClip.xyz, ro) - uClip.w;
    if (abs(dn) < 1e-6) { if (dp > 0.0) return -1.0; }
    else {
      float th = -dp / dn;
      if (dn > 0.0) t1 = min(t1, th);
      else if (th > t0) { t0 = th; cut = true; onPlane = true; }
    }
  }
  if (t0 > t1) return -1.0;
  if (cut && insideSet(ro + t0 * rd, ftrap)) { face = onPlane ? 2 : 1; return t0; }
  float t = t0;
  for (int i = 0; i < 512; i++) {
    if (i >= uSteps) break;
    float h = de(ro + t * rd, trap);
    if (h < max((pix0 + t * pixK) * uDetail, 2e-6)) return t;
    t += h * 0.92;
    if (t > t1) break;
  }
  return -1.0;
}

// Moving frames run the same occlusion and shadow, with fewer, longer steps,
// so the image does not change tone when scrolling stops.
float softShadow(vec3 ro, vec3 rd, float mint) {
  vec2 bs = sphereHit(ro, rd, uBound);
  float tmax = max(bs.y, mint);
  float res = 1.0;
  float t = mint;
  for (int i = 0; i < 80; i++) {
    if (i >= uShadowSteps) break;
    float h = deOnly(ro + t * rd);
    res = min(res, 10.0 * h / t);
    t += clamp(h, uShadowMinStep, 0.15);
    if (res < 0.002 || t > tmax) break;
  }
  res = clamp(res, 0.0, 1.0);
  return res * res * (3.0 - 2.0 * res);
}

// Probe distances scale with the viewing distance, so a close-up is not
// smothered by occlusion measured at the scale of the whole object.
float calcAO(vec3 pos, vec3 nor, float t) {
  float occ = 0.0;
  float n = 0.0;
  float s = clamp(t * 0.33, 0.04, 1.0);
  for (int i = 0; i < 5; i += uAOStride) {
    float h = s * (0.01 + 0.12 * float(i) / 4.0);
    occ += (h - deOnly(pos + h * nor)) * pow(0.9, float(i));
    n += 1.0;
  }
  occ *= 5.0 / n;
  return clamp(1.0 - 4.0 * occ / s, 0.0, 1.0);
}

vec3 shade(vec3 pos, vec3 nor, vec3 rd, vec4 trap, float t, float pixAng) {
  // Colour from the orbit trap: how close the orbit came to the origin.
  // Deep bronze in the folds, brass on the body, cream on the crests.
  float r = clamp(sqrt(trap.w), 0.0, 1.0);
  vec3 deep  = vec3(0.47, 0.27, 0.15);
  vec3 brass = vec3(0.80, 0.54, 0.33);
  vec3 cream = vec3(0.98, 0.85, 0.72);
  vec3 alb = mix(deep, brass, smoothstep(0.0, 0.45, r));
  alb = mix(alb, cream, 0.55 * smoothstep(0.45, 1.0, r));
  alb = mix(vec3(dot(alb, vec3(0.2126, 0.7152, 0.0722))), alb, 0.88);

  // Occlusion: the trap darkens deep folds cheaply; the full pass adds five
  // distance probes along the normal.
  // Floored so the inside of a tight ring stays lit paper-brown, never black.
  float occ = max(0.15, clamp(0.35 + 1.6 * r, 0.0, 1.0) * calcAO(pos, nor, t));

  vec3 L = uKeyDir;
  float dif = clamp(dot(nor, L), 0.0, 1.0);
  float sha = 1.0;
  if (dif > 0.001) {
    sha = 0.2 + 0.8 * softShadow(pos + nor * max(t * pixAng * 2.0, 1e-4), L, 0.004 * clamp(t, 0.2, 1.0));
  }
  vec3 H = normalize(L - rd);
  float ndh = clamp(dot(nor, H), 0.0, 1.0);
  float spe = (pow(ndh, 70.0) * 1.0 + pow(ndh, 12.0) * 0.12) * dif * sha;
  float fre = pow(clamp(1.0 + dot(nor, rd), 0.0, 1.0), 4.0);
  float fil = clamp(dot(nor, uFillDir), 0.0, 1.0);
  float sky = clamp(0.5 + 0.5 * nor.y, 0.0, 1.0);
  float bou = clamp(0.5 - 0.5 * nor.y, 0.0, 1.0);
  float hed = clamp(dot(nor, -rd), 0.0, 1.0);

  vec3 lin = 0.06 * vec3(1.00, 0.97, 0.93);  // ambient that nothing occludes
  lin += 2.60 * vec3(1.00, 0.92, 0.85) * dif * sha;
  lin += 0.20 * vec3(0.96, 0.95, 0.98) * fil * occ;
  lin += 0.30 * vec3(1.00, 0.97, 0.94) * sky * occ;
  lin += 0.14 * vec3(1.00, 0.86, 0.66) * bou * occ;
  lin += 0.30 * vec3(1.00, 0.96, 0.90) * fre * occ;
  lin += 0.45 * vec3(1.00, 0.94, 0.90) * hed * sqrt(occ);
  vec3 col = alb * lin;
  col += 1.5 * spe * mix(alb, vec3(1.0), 0.5);
  // With the key behind the object, edges facing away from the camera catch
  // it: a rim of light around the silhouette. Zero for the usual front key.
  float back = clamp(dot(rd, L), 0.0, 1.0);
  col += 1.6 * back * back * fre * mix(alb, vec3(1.0), 0.7);
  // A broad sheen facing the camera keeps deep views from going flat.
  col += 0.18 * pow(hed, 6.0) * occ * mix(alb, vec3(1.0), 0.6);
  return col;
}

// A cut face: the inside of the solid, banded by how its orbits behave.
vec3 shadeFace(vec3 nor, vec3 rd, float trap) {
  float lt = log(trap + 1e-5);
  float band = 0.5 + 0.5 * cos(4.0 * lt);
  vec3 cream = vec3(0.97, 0.87, 0.74);
  vec3 brass = vec3(0.80, 0.56, 0.36);
  vec3 deep  = vec3(0.52, 0.33, 0.20);
  vec3 alb = mix(brass, cream, band);
  alb = mix(deep, alb, smoothstep(-6.0, -1.5, lt));
  float dif = clamp(dot(nor, uKeyDir), 0.0, 1.0);
  float hed = clamp(dot(nor, -rd), 0.0, 1.0);
  return alb * (0.30 + 1.30 * dif * vec3(1.00, 0.93, 0.86) + 0.40 * hed);
}

void main() {
  vec2 frag = gl_FragCoord.xy + uJitter;
  vec2 p = (2.0 * frag - uRes) / uRes.y - uShift;
  // Rectilinear, fisheye (angle grows with distance from centre) and
  // orthographic rays, blended so a shot can change lens mid-move.
  float halfAng = atan(uTanHalfFov);
  vec3 rd = normalize(p.x * uTanHalfFov * uCamRight + p.y * uTanHalfFov * uCamUp + uCamFwd);
  float r = length(p);
  if (uFish > 0.0 && r > 1e-6) {
    float a = r * halfAng;
    vec3 fish = cos(a) * uCamFwd + sin(a) * (p.x / r * uCamRight + p.y / r * uCamUp);
    rd = normalize(mix(rd, fish, uFish));
  }
  float orthoScale = uFocusDist * uTanHalfFov;
  vec3 ro = uCamPos + uOrtho * orthoScale * (p.x * uCamRight + p.y * uCamUp);
  rd = normalize(mix(rd, uCamFwd, uOrtho));
  if (uLens.x != 0.0 || uLens.y != 0.0) {
    vec3 focal = ro + rd * (uFocusDist / dot(rd, uCamFwd));
    ro += uLens.x * uCamRight + uLens.y * uCamUp;
    rd = normalize(focal - ro);
  }
  float pixAng = 2.0 * mix(uTanHalfFov, halfAng, uFish) / uRes.y;
  float pix0 = uOrtho * 2.0 * orthoScale / uRes.y;
  float pixK = (1.0 - uOrtho) * pixAng;

  vec4 trap;
  int face;
  float ftrap;
  float t = march(ro, rd, pix0, pixK, trap, face, ftrap);
  vec3 col = uBg;
  if (t > 0.0) {
    vec3 pos = ro + t * rd;
    if (face == 0) {
      col = shade(pos, calcNormal(pos), rd, trap, t, pixK + pix0 / max(t, 1e-3));
    } else {
      vec3 n = face == 2 ? uClip.xyz : -rd;
      if (dot(n, rd) > 0.0) n = -n;
      col = shadeFace(n, rd, ftrap);
    }
    col = 1.0 - exp(-1.05 * col);
    col = mix(col, uBg, 1.0 - exp(-uHaze * t * t));
  }
  fragColor = vec4(col, 1.0);
}
`;

// Shows the refined image, or the low-resolution motion frame, or a blend
// while one hands over to the other. Encodes to sRGB and dithers so the soft
// gradients on white do not band.
export const PRESENT_FRAG = `#version 300 es
precision highp float;
uniform sampler2D uRestTex;
uniform sampler2D uMotionTex;
uniform float uMix;
uniform vec2  uOutRes;
out vec4 fragColor;

float hash(vec2 p) {
  p = fract(p * vec2(443.897, 441.423));
  p += dot(p, p.yx + 19.19);
  return fract((p.x + p.y) * p.x);
}

vec3 toSrgb(vec3 c) {
  c = clamp(c, 0.0, 1.0);
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
}

void main() {
  vec2 uv = gl_FragCoord.xy / uOutRes;
  vec3 a = texture(uMotionTex, uv).rgb;
  vec3 b = texture(uRestTex, uv).rgb;
  vec3 col = toSrgb(mix(a, b, uMix));
  col += (hash(gl_FragCoord.xy) + hash(gl_FragCoord.xy + 31.7) - 1.0) / 255.0;
  fragColor = vec4(col, 1.0);
}
`;
