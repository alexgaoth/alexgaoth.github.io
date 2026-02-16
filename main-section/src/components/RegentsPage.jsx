import { useState, useRef, useEffect, Component, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as THREE from 'three';
import SEO from './SEO';

// ---------------------------------------------------------------------------
// Data — add entries here as { name, glb, audio, bio }
// Files go in public/regents/  e.g. public/regents/regent_1.glb
// ---------------------------------------------------------------------------
const REGENTS = [
  {
    name: 'Sun, Yat-Sen',
    glb: '/regents/statue_of_dr._sun_yat-sen_in_nanjing_china.glb',
    audio: '/regents/yatsen.mp3',
    bio: 'The revolutionary who dared to imagine China reborn — not through dynasty, but through the will of its people. Sun Yat-Sen\'s conviction that a nation could be reshaped by ideas, not blood, is a quiet reminder that the world is more malleable than it appears.',
  },
  // { name: 'First Regent', glb: '/regents/regent_1.glb', audio: '/regents/regent_1.mp3', bio: '...' },
];

// ---------------------------------------------------------------------------
// 3D helpers
// ---------------------------------------------------------------------------
const toAbsolute = (path) =>
  `${process.env.PUBLIC_URL}/${path.replace(/^\//, '')}`;

function Model({ url, rotationRef }) {
  const gltf = useLoader(GLTFLoader, url);
  const groupRef = useRef();
  const normalised = useRef(false);

  useEffect(() => {
    if (!gltf.scene || normalised.current) return;
    const box = new THREE.Box3().setFromObject(gltf.scene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 2.2 / maxDim;
    gltf.scene.scale.setScalar(scale);
    gltf.scene.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
    normalised.current = true;
  }, [gltf.scene]);

  useFrame(() => {
    if (groupRef.current) groupRef.current.rotation.y = rotationRef.current;
  });

  return (
    <group ref={groupRef}>
      <primitive object={gltf.scene} />
    </group>
  );
}

// Applies momentum decay each frame when not dragging
function RotationController({ isDraggingRef, velocityRef, rotationRef }) {
  useFrame(() => {
    if (!isDraggingRef.current && Math.abs(velocityRef.current) > 0.0001) {
      rotationRef.current += velocityRef.current;
      velocityRef.current *= 0.92;
    }
  });
  return null;
}

function LoadingMesh() {
  const ref = useRef();
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.6;
  });
  return (
    <mesh ref={ref}>
      <boxGeometry args={[1.2, 1.2, 1.2]} />
      <meshStandardMaterial color="#888" wireframe />
    </mesh>
  );
}

class ModelErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <mesh>
          <boxGeometry args={[1.2, 1.2, 1.2]} />
          <meshStandardMaterial color="#ccc" wireframe />
        </mesh>
      );
    }
    return this.props.children;
  }
}

// ---------------------------------------------------------------------------
// Speaker icons
// ---------------------------------------------------------------------------
function IconSpeakerOn() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M11 5L6 9H2v6h4l5 4V5z" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}
function IconSpeakerOff() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M11 5L6 9H2v6h4l5 4V5z" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
const RegentsPage = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [audioStarted, setAudioStarted] = useState(false);
  const [maskHover, setMaskHover] = useState(false);
  const [maskLocked, setMaskLocked] = useState(false);

  const rotationRef = useRef(0);
  const velocityRef = useRef(0);
  const isDraggingRef = useRef(false);
  const lastXRef = useRef(0);
  const audioRef = useRef(null);
  const hasInteracted = useRef(false);

  const hasModels = REGENTS.length > 0;
  const current = hasModels ? REGENTS[currentIndex] : null;
  const maskActive = maskHover || maskLocked;

  // -------------------------------------------------------------------------
  // Audio
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!current) return;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    const audio = new Audio(toAbsolute(current.audio));
    audio.loop = true;
    audio.muted = isMuted;
    audioRef.current = audio;
    if (hasInteracted.current) audio.play().catch(() => {});
    return () => audio.pause();
  }, [currentIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const playAudio = () => {
    if (!hasInteracted.current) {
      hasInteracted.current = true;
      setAudioStarted(true);
      if (audioRef.current) audioRef.current.play().catch(() => {});
    }
  };

  const toggleMute = () => {
    setIsMuted(m => {
      const next = !m;
      if (audioRef.current) {
        audioRef.current.muted = next;
        if (!next && !hasInteracted.current) {
          hasInteracted.current = true;
          setAudioStarted(true);
          audioRef.current.play().catch(() => {});
        }
      }
      return next;
    });
  };

  // -------------------------------------------------------------------------
  // Drag with momentum
  // -------------------------------------------------------------------------
  useEffect(() => {
    const onMove = (e) => {
      if (!isDraggingRef.current) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const delta = (clientX - lastXRef.current) * 0.012;
      rotationRef.current += delta;
      // Smooth velocity tracking (lerp toward latest delta)
      velocityRef.current = velocityRef.current * 0.4 + delta * 0.6;
      lastXRef.current = clientX;
    };
    const onUp = () => { isDraggingRef.current = false; };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, []);

  const startDrag = (clientX) => {
    if (maskActive) return;
    playAudio();
    isDraggingRef.current = true;
    velocityRef.current = 0;
    lastXRef.current = clientX;
  };

  // -------------------------------------------------------------------------
  // Navigation
  // -------------------------------------------------------------------------
  const goNext = () => {
    playAudio();
    setCurrentIndex(i => (i + 1) % REGENTS.length);
    rotationRef.current = 0;
    velocityRef.current = 0;
    setMaskLocked(false);
    setMaskHover(false);
  };

  const goPrev = () => {
    playAudio();
    setCurrentIndex(i => (i - 1 + REGENTS.length) % REGENTS.length);
    rotationRef.current = 0;
    velocityRef.current = 0;
    setMaskLocked(false);
    setMaskHover(false);
  };

  // -------------------------------------------------------------------------
  // Label interaction handlers
  // -------------------------------------------------------------------------
  const onLabelEnter = () => setMaskHover(true);
  const onLabelLeave = () => setMaskHover(false);
  const onLabelClick = () => {
    setMaskLocked(l => !l);
    setMaskHover(false);
  };

  const vizState = audioStarted && !isMuted ? 'playing' : 'muted';

  return (
    <>
      <SEO
        title="Regents of My Mind — alex gaoth"
        description="An interactive 3D exhibition of the regents of my mind."
        keywords="alex gaoth, regents, 3D, art"
        url="https://app.alexgaoth.com/regents"
      />

      <div className="regents-page">
        <button
          className="regents-back-btn"
          onClick={() => window.history.back()}
          aria-label="Go back"
        >
          <span style={{ fontSize: '0.85em' }}>←</span> back
        </button>

        <div className="regents-inner">
          <h1 className="regents-title">Regents of My Mind</h1>

          {!hasModels ? (
            <p className="regents-empty">no regents yet</p>
          ) : (
            <>
              <div className="regents-row">
                <button className="regent-arrow" onClick={goPrev} aria-label="Previous">‹</button>

                {/* Canvas + bio mask */}
                <div
                  className="regent-canvas-box"
                  onMouseDown={e => startDrag(e.clientX)}
                  onTouchStart={e => startDrag(e.touches[0].clientX)}
                >
                  <Canvas
                    camera={{ position: [0, 0.4, 3.5], fov: 42 }}
                    gl={{ alpha: true, antialias: true }}
                    style={{ width: '100%', height: '100%', display: 'block' }}
                  >
                    <ambientLight intensity={0.9} />
                    <directionalLight position={[3, 5, 3]} intensity={1.2} />
                    <directionalLight position={[-3, 2, -2]} intensity={0.3} />
                    <ModelErrorBoundary key={currentIndex}>
                      <Suspense fallback={<LoadingMesh />}>
                        <Model url={toAbsolute(current.glb)} rotationRef={rotationRef} />
                      </Suspense>
                    </ModelErrorBoundary>
                    <RotationController
                      isDraggingRef={isDraggingRef}
                      velocityRef={velocityRef}
                      rotationRef={rotationRef}
                    />
                  </Canvas>

                  {/* Bio overlay mask */}
                  <div className={`regent-bio-mask${maskActive ? ' regent-bio-mask--visible' : ''}`}>
                    {current.bio && (
                      <p className="regent-bio-text">{current.bio}</p>
                    )}
                  </div>
                </div>

                <button className="regent-arrow" onClick={goNext} aria-label="Next">›</button>
              </div>

              {/* Placard */}
              <div className="regent-placard">
                <p
                  className={`regent-label regent-label--interactive${maskLocked ? ' regent-label--locked' : ''}`}
                  onMouseEnter={onLabelEnter}
                  onMouseLeave={onLabelLeave}
                  onClick={onLabelClick}
                  title="hover to learn more"
                >
                  {current.name}
                </p>
                <div className="regent-rule" />
                <p className="regent-index">{currentIndex + 1} / {REGENTS.length}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Ambient music bar */}
      <div className="regents-music-bar">
        <div className={`regents-music-viz ${vizState}`}>
          <span /><span /><span /><span /><span />
        </div>
        <span className="regents-music-label">
          {isMuted
            ? 'sound muted'
            : audioStarted
            ? `ambient · ${current ? current.name : ''}`
            : 'interact to play ambient sound'}
        </span>
        <button
          className="regents-mute-btn"
          onClick={toggleMute}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <IconSpeakerOff /> : <IconSpeakerOn />}
        </button>
      </div>
    </>
  );
};

export default RegentsPage;
