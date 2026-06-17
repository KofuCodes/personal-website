import React, { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, RootState } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Closed-loop control over terrain.
 *
 * A Calc-3 surface  z = f(x, y, t)  is rendered as a faint wireframe. A glowing
 * rover roams a smooth parametric path across it. Its height is NOT snapped to
 * the surface — it tracks the terrain through a small PID feedback loop, so it
 * visibly lags and corrects:
 *
 *   reference (terrain height) → error → controller (Kp·e + Kd·ė) → rover height
 *                         ▲                                              │
 *                         └──────────────── sensor feedback ────────────┘
 *
 * The faint line is the reference (terrain), the bright line is the rover's
 * actual path, and the vertical stick between them is the live error. The small
 * 2D readout up top plots reference vs. output over time so the tracking/lag is
 * easy to read at a glance.
 */

const SPAN = 6;
const GRID = 36;
const TRAIL = 130;
const KP = 0.09;
const KD = 0.06;
const HIST = 90;

type Hist = { ref: number[]; act: number[] };

const getTerrainHeight = (x: number, y: number, t: number) =>
  0.45 * Math.sin(1.2 * x + t) + 0.3 * Math.cos(1.5 * y) + 0.15 * Math.sin(x * y);

const isDark = () =>
  typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

const labelCls =
  'mono text-[9px] uppercase tracking-wider whitespace-nowrap select-none pointer-events-none';

function Scene({ histRef }: { histRef: React.MutableRefObject<Hist> }) {
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

  const roverRef = useRef<THREE.Group>(null);
  const errLabel = useRef<THREE.Group>(null);
  const refLabel = useRef<THREE.Group>(null);
  const fbLabel = useRef<THREE.Group>(null);

  // ── line objects (built once, updated imperatively) ──
  const { desiredLine, actualLine, errorLine, normalArrow, axes } = useMemo(() => {
    const mkLine = (n: number) => {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
      g.setDrawRange(0, 0);
      const l = new THREE.Line(g, new THREE.LineBasicMaterial({ transparent: true }));
      l.frustumCulled = false;
      return l;
    };
    const desiredLine = mkLine(TRAIL);
    const actualLine = mkLine(TRAIL);

    const eg = new THREE.BufferGeometry();
    eg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
    const errorLine = new THREE.Line(eg, new THREE.LineBasicMaterial({ transparent: true, opacity: 0.6 }));
    errorLine.frustumCulled = false;

    const normalArrow = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(), 0.7, 0x888888, 0.18, 0.1);

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

    return { desiredLine, actualLine, errorLine, normalArrow, axes };
  }, []);

  const st = useRef({
    desired: [] as number[],
    actual: [] as number[],
    cy: 0,
    prevErr: 0,
    prevDark: null as boolean | null,
  });

  useFrame((state: RootState) => {
    const time = state.clock.elapsedTime;
    const tt = time * 0.18;
    const s = time * 0.6;
    const m = st.current;

    // ── theme colors (only on change) ──
    const dark = isDark();
    if (dark !== m.prevDark) {
      m.prevDark = dark;
      const ink = dark ? '#ededed' : '#1a1a1a';
      const wire = dark ? '#9a9a9a' : '#9a9a9a';
      const fill = dark ? '#ffffff' : '#000000';
      const faint = dark ? '#8a8a8a' : '#a6a6a6';
      wireMat.current?.color.set(wire);
      fillMat.current?.color.set(fill);
      roverMat.current?.color.set(ink);
      haloMat.current?.color.set(ink);
      desiredLine.material.color.set(faint);
      actualLine.material.color.set(ink);
      errorLine.material.color.set(ink);
      (normalArrow.line.material as THREE.LineBasicMaterial).color.set(faint);
      (normalArrow.cone.material as THREE.MeshBasicMaterial).color.set(faint);
      (axes.material as THREE.LineBasicMaterial).color.set(faint);
    }

    // ── shift the terrain surface ──
    const pos = geometry.attributes.position.array as Float32Array;
    for (let k = 0; k < baseXZ.length; k++) {
      pos[k * 3 + 1] = getTerrainHeight(baseXZ[k][0], baseXZ[k][1], tt);
    }
    geometry.attributes.position.needsUpdate = true;

    // ── rover path + closed-loop height tracking ──
    const px = 2.3 * Math.sin(s * 0.5);
    const pz = 2.3 * Math.cos(s * 0.37);
    const targetY = getTerrainHeight(px, pz, tt);
    const err = targetY - m.cy;
    const deriv = err - m.prevErr;
    m.cy += KP * err + KD * deriv;
    m.prevErr = err;

    roverRef.current?.position.set(px, m.cy, pz);

    // gradient / surface normal at the rover (slope feedback)
    const e = 0.05;
    const dfdx = (getTerrainHeight(px + e, pz, tt) - getTerrainHeight(px - e, pz, tt)) / (2 * e);
    const dfdz = (getTerrainHeight(px, pz + e, tt) - getTerrainHeight(px, pz - e, tt)) / (2 * e);
    const normal = new THREE.Vector3(-dfdx, 1, -dfdz).normalize();
    normalArrow.position.set(px, targetY, pz);
    normalArrow.setDirection(normal);

    // ── trajectories ──
    m.desired.push(px, targetY, pz);
    m.actual.push(px, m.cy, pz);
    if (m.desired.length > TRAIL * 3) m.desired.splice(0, 3);
    if (m.actual.length > TRAIL * 3) m.actual.splice(0, 3);

    const writeLine = (line: THREE.Line, arr: number[]) => {
      const p = line.geometry.attributes.position.array as Float32Array;
      p.set(arr);
      line.geometry.setDrawRange(0, arr.length / 3);
      line.geometry.attributes.position.needsUpdate = true;
    };
    writeLine(desiredLine, m.desired);
    writeLine(actualLine, m.actual);

    // ── error vector ──
    const ep = errorLine.geometry.attributes.position.array as Float32Array;
    ep[0] = px; ep[1] = m.cy; ep[2] = pz;
    ep[3] = px; ep[4] = targetY; ep[5] = pz;
    errorLine.geometry.attributes.position.needsUpdate = true;

    // ── feed the 2D readout (normalized reference vs output) ──
    const h = histRef.current;
    h.ref.push(Math.max(0, Math.min(1, (targetY + 1) / 2)));
    h.act.push(Math.max(0, Math.min(1, (m.cy + 1) / 2)));
    if (h.ref.length > HIST) h.ref.shift();
    if (h.act.length > HIST) h.act.shift();

    // ── label anchors ──
    errLabel.current?.position.set(px, (m.cy + targetY) / 2, pz);
    if (m.desired.length >= 3) {
      refLabel.current?.position.set(m.desired[0], m.desired[1], m.desired[2]);
    }
    const fi = Math.floor(m.actual.length / 3 / 2) * 3;
    if (m.actual.length >= fi + 3) {
      fbLabel.current?.position.set(m.actual[fi], m.actual[fi + 1], m.actual[fi + 2]);
    }

    // ── slow camera orbit (zoomed in) ──
    const a = time * 0.11;
    const R = 6.1;
    state.camera.position.set(Math.cos(a) * R, 3.5, Math.sin(a) * R);
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
        <meshBasicMaterial ref={wireMat} wireframe transparent opacity={0.26} />
      </mesh>

      <primitive object={axes} />
      <primitive object={desiredLine} />
      <primitive object={actualLine} />
      <primitive object={errorLine} />
      <primitive object={normalArrow} />

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
        <Html center position={[0, 0.34, 0]} pointerEvents="none">
          <div className={`${labelCls} text-neutral-600 dark:text-neutral-300`}>controller correction</div>
        </Html>
      </group>

      <group ref={errLabel}>
        <Html center position={[0.28, 0, 0]} pointerEvents="none">
          <div className={`${labelCls} text-neutral-600 dark:text-neutral-300`}>error</div>
        </Html>
      </group>
      <group ref={refLabel}>
        <Html center pointerEvents="none">
          <div className={`${labelCls} text-neutral-400 dark:text-neutral-500`}>reference</div>
        </Html>
      </group>
      <group ref={fbLabel}>
        <Html center pointerEvents="none">
          <div className={`${labelCls} text-neutral-400 dark:text-neutral-500`}>feedback</div>
        </Html>
      </group>
    </>
  );
}

/** Small 2D readout: reference (dashed) vs. output (solid) over time. */
const MiniGraph: React.FC<{ histRef: React.MutableRefObject<Hist>; className?: string }> = ({ histRef, className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf = 0;

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      if (!r.width) return;
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round(r.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const draw = () => {
      const dark = isDark();
      const ink = dark ? '233,233,233' : '26,26,26';
      const faint = dark ? '138,138,138' : '166,166,166';
      const W = canvas.clientWidth;
      const H = canvas.clientHeight;
      ctx.clearRect(0, 0, W, H);
      if (W && H) {
        ctx.strokeStyle = `rgba(${ink},0.22)`;
        ctx.lineWidth = 1;
        ctx.strokeRect(0.5, 0.5, W - 1, H - 1);

        const refA = histRef.current.ref;
        const actA = histRef.current.act;
        const n = Math.min(refA.length, actA.length);
        if (n > 1) {
          const pad = 4;
          const mapX = (i: number) => pad + (i / (n - 1)) * (W - 2 * pad);
          const mapY = (v: number) => H - pad - v * (H - 2 * pad);

          ctx.setLineDash([3, 3]);
          ctx.strokeStyle = `rgba(${faint},0.85)`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          for (let i = 0; i < n; i++) {
            const x = mapX(i);
            const y = mapY(refA[i]);
            i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
          }
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.strokeStyle = `rgba(${ink},0.95)`;
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          for (let i = 0; i < n; i++) {
            const x = mapX(i);
            const y = mapY(actA[i]);
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
      <div className="mono text-[9px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-1 flex items-center gap-2">
        <span>reference / output</span>
      </div>
      <canvas ref={canvasRef} className="w-full h-[42px]" />
    </div>
  );
};

const ClosedLoopControlTerrain: React.FC = () => {
  const histRef = useRef<Hist>({ ref: [], act: [] });

  return (
    <div className="relative w-full h-full">
      <Canvas
        className="!touch-none"
        dpr={[1, 1.6]}
        camera={{ position: [6.1, 3.5, 6.1], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ background: 'transparent' }}
      >
        <Scene histRef={histRef} />
      </Canvas>

      {/* caption */}
      <div className="absolute top-2 left-1 pointer-events-none select-none">
        <div className="text-[14px] font-semibold tracking-tight text-neutral-800 dark:text-neutral-100">closed-loop</div>
        <div className="mono text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5 max-w-[16rem] leading-snug">
          feedback that never stops correcting toward the target.
        </div>
      </div>

      {/* 2D readout */}
      <MiniGraph histRef={histRef} className="absolute top-2 right-1 w-40" />
    </div>
  );
};

export default ClosedLoopControlTerrain;
