import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, RootState } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { ready } from '../boot';

/**
 * Closed-loop control with a real goal.
 *
 * A target marker sits on a slowly shifting terrain. The rover must drive to
 * it and hold its height locked to the moving surface within a tolerance band
 * (±BAND). Every feedback iteration counts as one "loop".
 *
 * Each run starts with deliberately detuned PD gains, so the rover visibly
 * lags. An adaptive tuner watches the error every ~0.75 s and retunes while
 * tracking is sluggish (raise Kp, with a touch more Kd). Once the error stays
 * inside the band long enough, the target is locked — "locked in N loops ·
 * M retunes" — then a new target spawns and the loop starts over from cold
 * gains.
 *
 *   reference (surface height) → error → PD controller → rover height
 *                     ▲              ↑ adaptive retuning ↑        │
 *                     └────────────── sensor feedback ────────────┘
 *
 * The simulation advances in fixed 1/60 s steps (accumulated from the render
 * delta), so loop counts and tuning behavior are identical on 60/120/144 Hz
 * displays.
 */

const SPAN = 6;
const GRID = 36;
const TRAIL = 160;
const HIST = 120;
const STEP = 1 / 60; // fixed simulation timestep
const BAND = 0.05; // goal: |error| stays inside this band
const SETTLE_FRAMES = 72; // ~1.2 s inside the band → locked
const EVAL_FRAMES = 45; // adaptive tuner window (~0.75 s)
const HOLD_SECONDS = 3; // pause on a locked target before the next one
const MAX_LOOPS = 2400; // failsafe (40 s of sim time) so a run can never stall
const ERR_SCALE = 0.6; // vertical range of the error readout
// Camera orbit — lower these together to make the terrain fill more of the stage.
const CAM_R = 4.9;
const CAM_Y = 2.8;

type Hist = { err: number[] };
type Phase = 'travel' | 'settle' | 'locked';
type Status = {
  loop: number;
  retunes: number;
  kp: number;
  kd: number;
  phase: Phase;
  lockedLoops: number;
  lockedRetunes: number;
  lastTune: string;
};

const getTerrainHeight = (x: number, y: number, t: number) =>
  0.45 * Math.sin(1.2 * x + t) + 0.3 * Math.cos(1.5 * y) + 0.15 * Math.sin(x * y);

const detunedGains = () => ({
  kp: 0.015 + Math.random() * 0.025,
  kd: Math.random() * 0.015,
});

const labelCls =
  'tabular-nums text-[10px] uppercase tracking-wider whitespace-nowrap select-none pointer-events-none';

function Scene({
  histRef,
  statusRef,
}: {
  histRef: React.MutableRefObject<Hist>;
  statusRef: React.MutableRefObject<Status>;
}) {
  // ── terrain geometry (positions updated each frame) ──
  const { geometry, baseXZ } = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions: number[] = [];
    const xz: [number, number][] = [];
    for (let i = 0; i <= GRID; i++) {
      for (let j = 0; j <= GRID; j++) {
        const x = -SPAN / 2 + (SPAN * i) / GRID;
        const z = -SPAN / 2 + (SPAN * j) / GRID;
        positions.push(x, 0, z);
        xz.push([x, z]);
      }
    }
    const index: number[] = [];
    for (let i = 0; i < GRID; i++) {
      for (let j = 0; j < GRID; j++) {
        const a = i * (GRID + 1) + j;
        const b = a + 1;
        const c = a + (GRID + 1);
        const d = c + 1;
        index.push(a, b, d, a, d, c);
      }
    }
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
    geo.setIndex(index);
    return { geometry: geo, baseXZ: xz };
  }, []);

  const wireMat = useRef<THREE.MeshBasicMaterial>(null);
  const fillMat = useRef<THREE.MeshBasicMaterial>(null);
  const roverMat = useRef<THREE.MeshBasicMaterial>(null);
  const haloMat = useRef<THREE.MeshBasicMaterial>(null);
  const ringMat = useRef<THREE.MeshBasicMaterial>(null);
  const pulseMat = useRef<THREE.MeshBasicMaterial>(null);
  const beaconMat = useRef<THREE.MeshBasicMaterial>(null);

  const roverRef = useRef<THREE.Group>(null);
  const goalRef = useRef<THREE.Group>(null);
  const pulseRef = useRef<THREE.Mesh>(null);
  const goalLabelRef = useRef<HTMLDivElement>(null);

  // ── line objects (built once, updated imperatively) ──
  const { actualLine, errorLine, axes } = useMemo(() => {
    const tg = new THREE.BufferGeometry();
    tg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(TRAIL * 3), 3));
    tg.setDrawRange(0, 0);
    const actualLine = new THREE.Line(tg, new THREE.LineBasicMaterial({ transparent: true }));
    actualLine.frustumCulled = false;

    const eg = new THREE.BufferGeometry();
    eg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
    const errorLine = new THREE.Line(eg, new THREE.LineBasicMaterial({ transparent: true, opacity: 0.6 }));
    errorLine.frustumCulled = false;

    const c = -SPAN / 2;
    const cy = -1.15;
    const av: number[] = [
      c, cy, c, c + 1.2, cy, c,
      c, cy, c, c, cy + 1.0, c,
      c, cy, c, c, cy, c + 1.2,
    ];
    const ag = new THREE.BufferGeometry();
    ag.setAttribute('position', new THREE.BufferAttribute(new Float32Array(av), 3));
    const axes = new THREE.LineSegments(ag, new THREE.LineBasicMaterial({ transparent: true, opacity: 0.35 }));
    axes.frustumCulled = false;

    return { actualLine, errorLine, axes };
  }, []);

  // Manually-created three objects aren't managed by r3f — free them on unmount.
  useEffect(
    () => () => {
      geometry.dispose();
      for (const obj of [actualLine, errorLine, axes]) {
        obj.geometry.dispose();
        (obj.material as THREE.Material).dispose();
      }
    },
    [geometry, actualLine, errorLine, axes]
  );

  const st = useRef({
    started: false,
    acc: 0, // unsimulated time carried between frames
    simT: 0, // simulation clock (fixed steps)
    px: 0, pz: 0,
    cy: 0,
    prevErr: 0,
    colored: false,
    // current run: start → (bezier ctrl) → goal
    sx: 0, sz: 0, gx: 0, gz: 0, cx: 0, cz: 0,
    t0: 0,
    dur: 3,
    phase: 'travel' as Phase,
    settleCount: 0,
    lockedAt: 0,
    // adaptive tuner window stats
    winAbs: 0, winN: 0,
    labelTxt: '',
    trail: [] as number[],
  });

  const newTarget = (simT: number, fromX: number, fromZ: number) => {
    const m = st.current;
    const S = statusRef.current;
    m.sx = fromX;
    m.sz = fromZ;
    // pick a goal a good distance away, inside the terrain
    let gx = fromX, gz = fromZ;
    for (let tries = 0; tries < 24; tries++) {
      const r = 2.35 * Math.sqrt(Math.random());
      const a = Math.random() * Math.PI * 2;
      gx = r * Math.cos(a);
      gz = r * Math.sin(a);
      if (Math.hypot(gx - fromX, gz - fromZ) >= 1.8) break;
    }
    m.gx = gx;
    m.gz = gz;
    // gentle arc: bezier control point offset perpendicular to the straight path
    const dx = gx - fromX, dz = gz - fromZ;
    const dist = Math.hypot(dx, dz) || 1;
    const side = Math.random() < 0.5 ? -1 : 1;
    m.cx = (fromX + gx) / 2 + (-dz / dist) * side * 0.35 * dist;
    m.cz = (fromZ + gz) / 2 + (dx / dist) * side * 0.35 * dist;
    m.dur = Math.min(4.5, Math.max(2.2, dist / 0.9));
    m.t0 = simT;
    m.phase = 'travel';
    m.settleCount = 0;
    m.winAbs = 0; m.winN = 0;
    // cold start: every run begins detuned so the adaptation is visible
    const g = detunedGains();
    S.kp = g.kp;
    S.kd = g.kd;
    S.loop = 0;
    S.retunes = 0;
    S.lastTune = '';
    S.phase = 'travel';
  };

  // One fixed 1/60 s simulation step — behavior is identical at any display rate.
  const stepSim = () => {
    const m = st.current;
    const S = statusRef.current;
    const tt = m.simT * 0.18;

    // rover position: travel along the arc, then hold at the goal
    if (m.phase === 'travel') {
      const p = Math.min(1, (m.simT - m.t0) / m.dur);
      const e = p * p * (3 - 2 * p); // smoothstep easing
      const u = 1 - e;
      m.px = u * u * m.sx + 2 * u * e * m.cx + e * e * m.gx;
      m.pz = u * u * m.sz + 2 * u * e * m.cz + e * e * m.gz;
      if (p >= 1) {
        m.phase = 'settle';
        S.phase = 'settle';
      }
    } else {
      m.px = m.gx;
      m.pz = m.gz;
    }

    // the closed loop: PD height control toward the moving surface
    const targetY = getTerrainHeight(m.px, m.pz, tt);
    const err = targetY - m.cy;
    m.cy += S.kp * err + S.kd * (err - m.prevErr);
    m.prevErr = err;

    if (m.phase !== 'locked') {
      S.loop++;

      // adaptive tuner: evaluate a window of error, retune while sluggish
      m.winAbs += Math.abs(err);
      m.winN++;
      if (m.winN >= EVAL_FRAMES) {
        if (m.winAbs / m.winN > BAND * 1.3) {
          S.kp = Math.min(S.kp + 0.035, 0.4);
          S.kd = Math.min(S.kd + 0.008, 0.22);
          S.retunes++;
          S.lastTune = 'Kp↑';
        } else {
          S.lastTune = '';
        }
        m.winAbs = 0;
        m.winN = 0;
      }

      // goal check: error held inside the band long enough → locked
      if (m.phase === 'settle') {
        m.settleCount = Math.abs(err) <= BAND ? m.settleCount + 1 : 0;
        if (m.settleCount >= SETTLE_FRAMES || S.loop >= MAX_LOOPS) {
          m.phase = 'locked';
          m.lockedAt = m.simT;
          S.phase = 'locked';
          S.lockedLoops = S.loop;
          S.lockedRetunes = S.retunes;
        }
      }
    } else if (m.simT - m.lockedAt > HOLD_SECONDS) {
      newTarget(m.simT, m.px, m.pz);
    }

    // trail + error history advance at the fixed sim rate
    m.trail.push(m.px, m.cy, m.pz);
    if (m.trail.length > TRAIL * 3) m.trail.splice(0, 3);
    const h = histRef.current;
    h.err.push(Math.max(-ERR_SCALE, Math.min(ERR_SCALE, err)));
    if (h.err.length > HIST) h.err.shift();
  };

  useFrame((state: RootState, delta: number) => {
    const m = st.current;

    if (!m.started) {
      m.started = true;
      newTarget(0, 0, 0);
      m.cy = getTerrainHeight(0, 0, 0);
    }

    // ── colors (once, on the first frame, when the materials exist) ──
    if (!m.colored) {
      m.colored = true;
      const ink = '#2a3035';
      const faint = '#a3abb0';
      // The goal wears the site's beak-orange "target" accent
      const accent = '#a3541a';
      wireMat.current?.color.set('#9aa3a8');
      fillMat.current?.color.set('#1b1f22');
      roverMat.current?.color.set(ink);
      haloMat.current?.color.set(ink);
      ringMat.current?.color.set(accent);
      pulseMat.current?.color.set(accent);
      beaconMat.current?.color.set(faint);
      actualLine.material.color.set(ink);
      errorLine.material.color.set(ink);
      (axes.material as THREE.LineBasicMaterial).color.set(faint);
    }

    // ── advance the simulation in fixed steps ──
    m.acc = Math.min(m.acc + delta, 0.25);
    while (m.acc >= STEP) {
      m.acc -= STEP;
      m.simT += STEP;
      stepSim();
    }

    const tt = m.simT * 0.18;

    // ── shift the terrain surface ──
    const pos = geometry.attributes.position.array as Float32Array;
    for (let k = 0; k < baseXZ.length; k++) {
      pos[k * 3 + 1] = getTerrainHeight(baseXZ[k][0], baseXZ[k][1], tt);
    }
    geometry.attributes.position.needsUpdate = true;

    // ── write render objects from sim state ──
    roverRef.current?.position.set(m.px, m.cy, m.pz);

    const tp = actualLine.geometry.attributes.position.array as Float32Array;
    tp.set(m.trail);
    actualLine.geometry.setDrawRange(0, m.trail.length / 3);
    actualLine.geometry.attributes.position.needsUpdate = true;

    // error stick (rover ↔ surface)
    const targetY = getTerrainHeight(m.px, m.pz, tt);
    const ep = errorLine.geometry.attributes.position.array as Float32Array;
    ep[0] = m.px; ep[1] = m.cy; ep[2] = m.pz;
    ep[3] = m.px; ep[4] = targetY; ep[5] = m.pz;
    errorLine.geometry.attributes.position.needsUpdate = true;

    // goal marker: sit on the moving surface, pulse until locked
    const gy = getTerrainHeight(m.gx, m.gz, tt);
    goalRef.current?.position.set(m.gx, gy + 0.02, m.gz);
    if (pulseRef.current && pulseMat.current && ringMat.current) {
      if (m.phase === 'locked') {
        pulseMat.current.opacity = 0;
        ringMat.current.opacity = 1;
      } else {
        const frac = (m.simT % 1.6) / 1.6;
        pulseRef.current.scale.setScalar(1 + 1.1 * frac);
        pulseMat.current.opacity = 0.45 * (1 - frac);
        ringMat.current.opacity = 0.85;
      }
    }
    const label = m.phase === 'locked' ? 'locked' : 'target';
    if (label !== m.labelTxt && goalLabelRef.current) {
      m.labelTxt = label;
      goalLabelRef.current.textContent = label;
    }

    // ── slow camera orbit ──
    // Pulled in from 6.1/3.5 so the terrain fills the stage instead of
    // floating in it; the look-at angle is unchanged (same ratio).
    const a = state.clock.elapsedTime * 0.11;
    state.camera.position.set(Math.cos(a) * CAM_R, CAM_Y, Math.sin(a) * CAM_R);
    state.camera.lookAt(0, 0.1, 0);
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[6, 9, 4]} intensity={0.7} />

      {/* surface fill */}
      <mesh geometry={geometry}>
        <meshBasicMaterial ref={fillMat} transparent opacity={0.03} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
      {/* wireframe */}
      <mesh geometry={geometry}>
        <meshBasicMaterial ref={wireMat} wireframe transparent opacity={0.22} />
      </mesh>

      <primitive object={axes} />
      <primitive object={actualLine} />
      <primitive object={errorLine} />

      {/* goal marker: ring + expanding pulse + beacon */}
      <group ref={goalRef}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.15, 0.19, 40]} />
          <meshBasicMaterial ref={ringMat} transparent side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
        <mesh ref={pulseRef} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.19, 0.205, 40]} />
          <meshBasicMaterial ref={pulseMat} transparent side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.0045, 0.0045, 0.6, 6]} />
          <meshBasicMaterial ref={beaconMat} transparent opacity={0.35} />
        </mesh>
        {/* low zIndexRange keeps the in-scene label under the HUD and any open preview card */}
        <Html center position={[0, 0.74, 0]} pointerEvents="none" zIndexRange={[5, 0]}>
          <div ref={goalLabelRef} className={`${labelCls} text-ink-500`}>
            target
          </div>
        </Html>
      </group>

      {/* rover */}
      <group ref={roverRef}>
        <mesh>
          <sphereGeometry args={[0.075, 18, 18]} />
          <meshBasicMaterial ref={roverMat} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.19, 18, 18]} />
          <meshBasicMaterial ref={haloMat} transparent opacity={0.16} depthWrite={false} />
        </mesh>
      </group>
    </>
  );
}

/** Error readout: signed tracking error over time, with the ±BAND goal zone. */
const MiniGraph: React.FC<{ histRef: React.MutableRefObject<Hist>; className?: string }> = ({ histRef, className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let raf = 0;
    // Cached so the draw loop never reads layout (avoids per-frame reflow);
    // rawDpr is re-checked each frame to survive zoom / monitor changes.
    let W = 0;
    let H = 0;
    let rawDpr = 0;

    const resize = () => {
      rawDpr = window.devicePixelRatio || 1;
      const dpr = Math.min(rawDpr, 2);
      const r = canvas.getBoundingClientRect();
      if (!r.width) return;
      W = r.width;
      H = r.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const draw = () => {
      if ((window.devicePixelRatio || 1) !== rawDpr) resize();
      const ink = '42,48,53';
      const faint = '163,171,176';
      ctx.clearRect(0, 0, W, H);
      if (W && H) {
        const pad = 3;
        const mapY = (v: number) => H / 2 - (v / ERR_SCALE) * (H / 2 - pad);

        // goal zone: ±BAND — beak orange, matching the goal marker in the scene
        const bandTop = mapY(BAND);
        const bandBot = mapY(-BAND);
        ctx.fillStyle = 'rgba(163,84,26,0.10)';
        ctx.fillRect(0, bandTop, W, bandBot - bandTop);

        // zero line
        ctx.strokeStyle = `rgba(${faint},0.5)`;
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 3]);
        ctx.beginPath();
        ctx.moveTo(0, H / 2 + 0.5);
        ctx.lineTo(W, H / 2 + 0.5);
        ctx.stroke();
        ctx.setLineDash([]);

        // frame
        ctx.strokeStyle = `rgba(${ink},0.22)`;
        ctx.strokeRect(0.5, 0.5, W - 1, H - 1);

        // error curve
        const errA = histRef.current.err;
        const n = errA.length;
        if (n > 1) {
          const mapX = (i: number) => pad + (i / (HIST - 1)) * (W - 2 * pad);
          ctx.strokeStyle = `rgba(${ink},0.95)`;
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          for (let i = 0; i < n; i++) {
            const x = mapX(i + (HIST - n));
            const y = mapY(errA[i]);
            i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
          }
          ctx.stroke();
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [histRef]);

  return (
    <div className={`pointer-events-none select-none ${className ?? ''}`}>
      <div className="tabular-nums text-[10px] uppercase tracking-wider text-ink-400 mb-1">
        error · goal ±{BAND}
      </div>
      <canvas ref={canvasRef} className="w-full h-[42px]" />
    </div>
  );
};

/** Live text HUD — written imperatively so 60 fps updates never re-render React. */
const Hud: React.FC<{ statusRef: React.MutableRefObject<Status> }> = ({ statusRef }) => {
  const statusEl = useRef<HTMLDivElement>(null);
  const gainsEl = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    let prevStatus = '';
    let prevGains = '';

    const tick = () => {
      const s = statusRef.current;
      let statusTxt: string;
      let gainsTxt: string;
      if (s.phase === 'locked') {
        statusTxt = `✓ locked in ${s.lockedLoops} loops · ${s.lockedRetunes} retunes`;
        gainsTxt = `Kp ${s.kp.toFixed(2)} · Kd ${s.kd.toFixed(2)} · next target soon`;
      } else {
        statusTxt = `loop ${s.loop} · ${s.phase === 'travel' ? 'en route to target' : 'settling'}`;
        gainsTxt = `Kp ${s.kp.toFixed(2)} · Kd ${s.kd.toFixed(2)} · retunes ${s.retunes}${s.lastTune ? ` (${s.lastTune})` : ''}`;
      }
      if (statusTxt !== prevStatus && statusEl.current) {
        prevStatus = statusTxt;
        statusEl.current.textContent = statusTxt;
      }
      if (gainsTxt !== prevGains && gainsEl.current) {
        prevGains = gainsTxt;
        gainsEl.current.textContent = gainsTxt;
      }
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => cancelAnimationFrame(raf);
  }, [statusRef]);

  return (
    <div className="absolute top-2 left-1 z-10 pointer-events-none select-none max-w-[15rem]">
      <div className="text-[15px] font-semibold tracking-tight text-ink-800">closed-loop</div>
      <div className="tabular-nums text-[12px] text-ink-400 mt-0.5 leading-snug">
        goal: reach the marker, hold error within ±{BAND}
      </div>
      <div ref={statusEl} className="tabular-nums text-[12px] text-ink-600 mt-1.5" />
      <div ref={gainsEl} className="tabular-nums text-[11px] text-ink-400 mt-0.5" />
    </div>
  );
};

const ClosedLoopControlTerrain: React.FC = () => {
  const histRef = useRef<Hist>({ err: [] });
  const statusRef = useRef<Status>({
    loop: 0,
    retunes: 0,
    kp: 0.03,
    kd: 0.01,
    phase: 'travel',
    lockedLoops: 0,
    lockedRetunes: 0,
    lastTune: '',
  });

  const wrapRef = useRef<HTMLDivElement>(null);
  const [frameloop, setFrameloop] = useState<'always' | 'never'>('always');
  // Fades in once the first frames are drawn (and the page has revealed),
  // rather than popping in whenever this chunk and WebGL happen to be ready.
  const [shown, setShown] = useState(false);
  const onCreated = () =>
    ready.then(() => requestAnimationFrame(() => requestAnimationFrame(() => setShown(true))));

  // Pause the sim + render loop entirely while scrolled offscreen.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      setFrameloop(entry.isIntersecting ? 'always' : 'never');
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    // isolate: keeps the HUD/graph overlays inside this box so they can't
    // compete with the rest of the page's stacking order.
    <div
      ref={wrapRef}
      className={`relative isolate w-full h-full transition-opacity duration-1000 ease-out ${shown ? 'opacity-100' : 'opacity-0'}`}
    >
      <Canvas
        frameloop={frameloop}
        dpr={[1, 1.6]}
        camera={{ position: [CAM_R, CAM_Y, CAM_R], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ background: 'transparent' }}
        onCreated={onCreated}
      >
        <Scene histRef={histRef} statusRef={statusRef} />
      </Canvas>

      <Hud statusRef={statusRef} />
      <MiniGraph histRef={histRef} className="absolute top-2 right-1 z-10 w-36 hidden sm:block" />
    </div>
  );
};

export default ClosedLoopControlTerrain;
