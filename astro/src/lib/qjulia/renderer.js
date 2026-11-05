// WebGL2 renderer for the quaternion Julia set. Two kinds of pass:
//   motion — one sample at reduced resolution, cheap lighting, shown at once.
//   rest   — full resolution, full lighting, one jittered sample per sweep,
//            averaged into a half-float buffer until the image settles.
// Rest sweeps can be split into bands of rows so no single frame stalls.
import { VERT, RENDER_FRAG, PRESENT_FRAG } from './shaders.js';

const halton = (i, b) => {
  let f = 1, r = 0;
  while (i > 0) { f /= b; r += f * (i % b); i = Math.floor(i / b); }
  return r;
};
const norm = (v) => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const comb = (a, x, b, y, c, z) => norm([a[0] * x + b[0] * y + c[0] * z, a[1] * x + b[1] * y + c[1] * z, a[2] * x + b[2] * y + c[2] * z]);

// cam: { pos, target, fov (vertical, degrees), roll (radians), aperture, focus }
// Turns the slicing hyperplane through 4D: by angle a (degrees) in the plane
// of the 1 and k axes, then by b in the plane of the i and k axes. Column-major.
export function rot4(angles) {
  const [a = 0, b = 0] = angles || [];
  const ca = Math.cos((a * Math.PI) / 180), sa = Math.sin((a * Math.PI) / 180);
  const cb = Math.cos((b * Math.PI) / 180), sb = Math.sin((b * Math.PI) / 180);
  // Ra mixes components 0 and 3, Rb mixes 1 and 3; R = Rb * Ra.
  const Ra = [ca, 0, 0, sa, 0, 1, 0, 0, 0, 0, 1, 0, -sa, 0, 0, ca];
  const Rb = [1, 0, 0, 0, 0, cb, 0, sb, 0, 0, 1, 0, 0, -sb, 0, cb];
  const out = new Float32Array(16);
  for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) {
    let v = 0;
    for (let k = 0; k < 4; k++) v += Rb[k * 4 + r] * Ra[c * 4 + k];
    out[c * 4 + r] = v;
  }
  return out;
}

export function cameraBasis(cam) {
  const fwd = norm(sub(cam.target, cam.pos));
  let right = norm(cross(fwd, [0, 1, 0]));
  let up = cross(right, fwd);
  if (cam.roll) {
    const c = Math.cos(cam.roll), s = Math.sin(cam.roll);
    const r2 = [right[0] * c + up[0] * s, right[1] * c + up[1] * s, right[2] * c + up[2] * s];
    up = [up[0] * c - right[0] * s, up[1] * c - right[1] * s, up[2] * c - right[2] * s];
    right = r2;
  }
  if (cam.mirror) right = [-right[0], -right[1], -right[2]];
  // Key light rides with the camera, up and to the left; fill from the right.
  // keyFront > 0 puts the key behind the object: a backlight.
  const key = comb(right, cam.keySide ?? -0.55, up, cam.keyUp ?? 0.72, fwd, cam.keyFront ?? -0.42);
  const fill = comb(right, 0.85, up, -0.05, fwd, -0.35);
  return { fwd, right, up, key, fill };
}

function compileShader(gl, type, src) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src.trim());
  gl.compileShader(s);
  return s;
}

function makeTarget(gl, w, h, float) {
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  if (float) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);
  else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  const fbo = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  return { tex, fbo, w, h, ok };
}

export class Renderer {
  constructor(canvas, { preserve = false } = {}) {
    const gl = canvas.getContext('webgl2', {
      alpha: false, antialias: false, depth: false, stencil: false,
      premultipliedAlpha: false, preserveDrawingBuffer: preserve,
      powerPreference: 'high-performance',
    });
    if (!gl) throw new Error('webgl2-unavailable');
    this.gl = gl;
    this.canvas = canvas;
    this.float = !!gl.getExtension('EXT_color_buffer_float');
    this.parallel = gl.getExtension('KHR_parallel_shader_compile');
    // GPU time of motion frames, where the browser exposes it. Lets the page
    // judge the GPU itself rather than frame cadence, which a hidden or
    // throttled window distorts.
    this.timer = gl.getExtension('EXT_disjoint_timer_query_webgl2');
    this.queries = [];
    this.gpuMs = 0;
    this.scene = { c: [-0.2, 0.6, 0.2, 0.2], slice: 0, iter: 12, bound: 1.6 };
    this.quality = { steps: 220, detail: 0.75, haze: 0.0, motionSteps: 140 };
    this.bg = [1, 1, 1];
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    this.vao = gl.createVertexArray();
    gl.bindVertexArray(this.vao);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    this.sampleIndex = 0;
    this.restRow = 0;
  }

  // Compiles without blocking the page where KHR_parallel_shader_compile
  // exists; resolves once both programs link.
  async compile() {
    const gl = this.gl;
    const mk = (fs) => {
      const p = gl.createProgram();
      gl.attachShader(p, compileShader(gl, gl.VERTEX_SHADER, VERT));
      gl.attachShader(p, compileShader(gl, gl.FRAGMENT_SHADER, fs));
      gl.bindAttribLocation(p, 0, 'aPos');
      gl.linkProgram(p);
      return p;
    };
    const progs = [mk(RENDER_FRAG), mk(PRESENT_FRAG)];
    if (this.parallel) {
      const done = () => progs.every((p) => gl.getProgramParameter(p, this.parallel.COMPLETION_STATUS_KHR));
      while (!done()) await new Promise((r) => requestAnimationFrame(r));
    }
    for (const p of progs) {
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
        const shaders = gl.getAttachedShaders(p);
        const log = shaders.map((s) => gl.getShaderInfoLog(s)).join('\n') + gl.getProgramInfoLog(p);
        throw new Error('shader: ' + log);
      }
    }
    [this.prog, this.present_] = progs;
    this.loc = {};
    for (const p of progs) {
      const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < n; i++) {
        const name = gl.getActiveUniform(p, i).name;
        this.loc[(p === this.prog ? 'r.' : 'p.') + name] = gl.getUniformLocation(p, name);
      }
    }
  }

  // Full-resolution size in device pixels; motion frames use a fraction.
  setSize(w, h) {
    if (this.w === w && this.h === h) return;
    this.w = w; this.h = h;
    this.canvas.width = w; this.canvas.height = h;
    const gl = this.gl;
    if (this.restT) { gl.deleteTexture(this.restT.tex); gl.deleteFramebuffer(this.restT.fbo); }
    this.restT = makeTarget(gl, w, h, this.float);
    this.motionT = null;
    this.sampleIndex = 0;
  }

  motionTarget(scale) {
    const w = Math.max(32, Math.round(this.w * scale));
    const h = Math.max(32, Math.round(this.h * scale));
    if (!this.motionT || this.motionT.w !== w || this.motionT.h !== h) {
      const gl = this.gl;
      if (this.motionT) { gl.deleteTexture(this.motionT.tex); gl.deleteFramebuffer(this.motionT.fbo); }
      this.motionT = makeTarget(gl, w, h, this.float);
    }
    return this.motionT;
  }

  setUniforms(target, cam, { rest, jitter = [0, 0], lens = [0, 0] }) {
    const gl = this.gl, L = this.loc, s = this.scene, q = this.quality;
    const b = cameraBasis(cam);
    gl.useProgram(this.prog);
    gl.uniform2f(L['r.uRes'], target.w, target.h);
    gl.uniform4fv(L['r.uC'], s.c);
    gl.uniform1f(L['r.uSlice'], cam.slice ?? s.slice);
    gl.uniform1f(L['r.uBound'], s.bound);
    gl.uniform1i(L['r.uIter'], cam.iter || s.iter);
    gl.uniform1i(L['r.uAOStride'], rest ? 1 : 2);
    gl.uniform1i(L['r.uShadowSteps'], rest ? 80 : 28);
    gl.uniform1f(L['r.uShadowMinStep'], rest ? 0.003 : 0.008);
    gl.uniform1i(L['r.uSteps'], rest ? q.steps : q.motionSteps);
    // cam.detail scales the hit threshold: the estimate runs about 3x short
    // just outside a smooth sphere, so a ball only a few pixels wide would
    // swell by most of a pixel footprint unless it is held tighter.
    gl.uniform1f(L['r.uDetail'], (rest ? q.detail : q.detail * 1.6) * (cam.detail ?? 1));
    gl.uniform3fv(L['r.uCamPos'], cam.pos);
    gl.uniform3fv(L['r.uCamRight'], b.right);
    gl.uniform3fv(L['r.uCamUp'], b.up);
    gl.uniform3fv(L['r.uCamFwd'], b.fwd);
    gl.uniform1f(L['r.uTanHalfFov'], Math.tan((cam.fov * Math.PI) / 360));
    gl.uniform2f(L['r.uJitter'], jitter[0], jitter[1]);
    gl.uniform2fv(L['r.uShift'], cam.offset || [0, 0]);
    gl.uniform2f(L['r.uLens'], lens[0], lens[1]);
    gl.uniform1f(L['r.uFocusDist'], cam.focus || Math.hypot(...sub(cam.target, cam.pos)));
    gl.uniform3fv(L['r.uKeyDir'], b.key);
    gl.uniform3fv(L['r.uFillDir'], b.fill);
    gl.uniform3fv(L['r.uBg'], this.bg);
    gl.uniform1f(L['r.uHaze'], q.haze);
    gl.uniformMatrix4fv(L['r.uRot'], false, rot4(cam.rot4));
    gl.uniform1f(L['r.uNear'], cam.near || 0);
    const clip = cam.clip;
    gl.uniform4f(L['r.uClip'], ...(clip ? [...clip.n, clip.w] : [0, 0, 1, 100]));
    gl.uniform1f(L['r.uFish'], cam.fish || 0);
    gl.uniform1f(L['r.uOrtho'], cam.ortho || 0);
  }

  drawMotion(cam, scale) {
    const gl = this.gl;
    const t = this.motionTarget(scale);
    this.setUniforms(t, cam, { rest: false });
    gl.bindFramebuffer(gl.FRAMEBUFFER, t.fbo);
    gl.viewport(0, 0, t.w, t.h);
    gl.disable(gl.BLEND);
    gl.disable(gl.SCISSOR_TEST);
    gl.bindVertexArray(this.vao);
    const q = this.timer && this.queries.length < 4 ? gl.createQuery() : null;
    if (q) gl.beginQuery(this.timer.TIME_ELAPSED_EXT, q);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (q) { gl.endQuery(this.timer.TIME_ELAPSED_EXT); this.queries.push(q); }
  }

  // Collects finished GPU timings; call once per frame.
  pollTimers() {
    const gl = this.gl;
    while (this.queries.length && gl.getQueryParameter(this.queries[0], gl.QUERY_RESULT_AVAILABLE)) {
      const q = this.queries.shift();
      if (!gl.getParameter(this.timer.GPU_DISJOINT_EXT)) this.gpuMs = gl.getQueryParameter(q, gl.QUERY_RESULT) / 1e6;
      gl.deleteQuery(q);
    }
  }

  // Starts averaging a new view from scratch.
  restBegin(cam) {
    this.restCam = cam;
    this.sampleIndex = 0;
    this.restRow = 0;
  }

  // Renders `rows` more rows of the current sample. Returns true when a
  // whole sample has been completed by this call.
  restStep(rows) {
    const gl = this.gl, t = this.restT, cam = this.restCam;
    const i = this.sampleIndex;
    const jitter = i === 0 ? [0, 0] : [halton(i + 1, 2) - 0.5, halton(i + 1, 3) - 0.5];
    let lens = [0, 0];
    if (cam.aperture) {
      const r = Math.sqrt(halton(i + 1, 5)) * cam.aperture, a = 2 * Math.PI * halton(i + 1, 7);
      lens = [r * Math.cos(a), r * Math.sin(a)];
    }
    this.setUniforms(t, cam, { rest: true, jitter, lens });
    gl.bindFramebuffer(gl.FRAMEBUFFER, t.fbo);
    gl.viewport(0, 0, t.w, t.h);
    const y0 = this.restRow, y1 = Math.min(t.h, y0 + Math.max(1, Math.floor(rows)));
    gl.enable(gl.SCISSOR_TEST);
    gl.scissor(0, y0, t.w, y1 - y0);
    if (i === 0) gl.disable(gl.BLEND);
    else {
      gl.enable(gl.BLEND);
      gl.blendColor(0, 0, 0, 1 / (i + 1));
      gl.blendFunc(gl.CONSTANT_ALPHA, gl.ONE_MINUS_CONSTANT_ALPHA);
    }
    gl.bindVertexArray(this.vao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.disable(gl.SCISSOR_TEST);
    gl.disable(gl.BLEND);
    this.restRow = y1;
    if (y1 >= t.h) { this.restRow = 0; this.sampleIndex = i + 1; return true; }
    return false;
  }

  // mix 0 shows the motion frame, 1 the averaged rest image.
  present(mix) {
    const gl = this.gl, L = this.loc;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.w, this.h);
    gl.useProgram(this.present_);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.restT.tex);
    gl.uniform1i(L['p.uRestTex'], 0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, (this.motionT || this.restT).tex);
    gl.uniform1i(L['p.uMotionTex'], 1);
    gl.uniform1f(L['p.uMix'], mix);
    gl.uniform2f(L['p.uOutRes'], this.w, this.h);
    gl.disable(gl.BLEND);
    gl.bindVertexArray(this.vao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
}

// Radius of a ball that contains the filled Julia set of q^2 + c.
export const escapeRadius = (c) => 0.5 + Math.sqrt(0.25 + Math.hypot(...c)) + 0.05;
