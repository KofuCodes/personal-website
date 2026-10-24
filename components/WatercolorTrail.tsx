import React, { useEffect, useRef, useState } from 'react';

/**
 * Watercolor brush trail: the cursor is a damp brush grazing the paper.
 * The cursor drops soft, irregular pigment stamps (sized and spaced by speed) into a
 * low-res offscreen "wet" buffer that is rebuilt each frame from a short list of
 * timestamped dabs, so drying is deterministic and always ends at exactly zero.
 * That buffer is composited minus a blurred copy of itself (destination-out) so pigment
 * pools at the rim, then as a faint body wash; a tiled noise knocks out paper-tooth specks,
 * and the freshest dabs carry a brief darker wet sheen that dries back to rim + wash.
 */

// ── tunables ────────────────────────────────────────────────────────────────
// resolution
const RES = 0.6; // internal px per CSS px; CSS upscales and the wash hides the softness
const MAX_PX = 1_100_000; // cap on internal pixels for very large viewports
// brush
const R_MIN = 2.5; // CSS px radius when fast (~5px wide)
const R_MAX = 7; // CSS px radius when slow (~14px wide)
const V_SLOW = 120; // px/s at or below which the brush is fully wet
const V_FAST = 1500; // px/s at or above which it is fully dry
const SPEED_TAU = 70; // ms time-constant of the speed smoothing
const SPACING = 0.5; // dab spacing as a fraction of radius on a wet stroke
const DRY_SPREAD = 0.45; // extra spacing on a dry stroke, so coverage thins out
const GAP_P = 0.08; // per-dab chance (x dryness^2) to skip 1-2 dabs: broken dry-brush
const SPECK_P = 0.04; // per-dab chance (x dryness) of a stray-hair speck beside the stroke
const WOBBLE = 0.14; // slow width undulation along the stroke
const TAPER_PX = 18; // touch-down taper length, CSS px
const JUMP = 120; // px between samples that starts a new stroke instead of a line
const LIFT_MS = 450; // stillness that counts as the brush leaving the paper
// drying
const TTL_WET = 4100; // ms until slow/wet paint is fully gone
const TTL_DRY = 2800; // ms until fast/dry paint is fully gone
const HOLD = 0.2; // fraction of the lifetime before fading starts
const BLEED = 0.18; // radius growth while damp (wet strokes only)
const BLEED_MS = 450; // how long the bleed takes to settle
const DRY_MS = 700; // how long the wet sheen lasts
// opacity
const DAB_A = 0.6; // per-dab alpha into the wet buffer (overlaps saturate to a flat wash)
const BODY_A = 0.062; // flat wash opacity on screen
const RIM_A = 0.19; // edge-darkening opacity on screen
const WET_A = 0.02; // per-dab sheen alpha while wet (stacks ~4 deep on a slow stroke)
const GRAIN_A = 0.55; // how hard paper tooth knocks pigment out
const RIM_BLUR = 2.2; // internal px blur the rim is carved from (rim ~1.5px wide)
// pigment
const PICK_MIN = 5000; // ms, shortest time before the brush picks up a new pigment
const PICK_MAX = 9000; // ms, longest
const RARE_P = 0.1; // chance a pickup is the beak orange
const MIX_DABS = 16; // dabs over which a mid-stroke pickup dithers into the new colour
const LOAD_MIN = 0.55; // how faint a brush that has run dry gets
const LOAD_FALLOFF = 2600; // CSS px of painting for the load to fall ~63% of the way

// From the geese painting; the last colour is the rare one
const pal = {
  cols: ['#4a5560', '#8fa39a', '#9fb2c4', '#9c8a70', '#d08a3e'],
  strength: [0.8, 1.15, 1.2, 1, 0.9], // evens out payne's grey vs the pale washes
};

// internals
const CAP = 4096; // ring of live dabs, power of two
const MASK = CAP - 1;
const SHAPES = 10; // irregular sprite variants
const VERTS = 28;
const SR = 5; // sprite nominal radius in atlas px
const CELL = 24; // atlas cell; wide margins so mipmapped sampling never bleeds neighbours
const HALF = CELL / 2 / SR; // dab radius -> half the drawn cell
const GRAIN_TILE = 128;
const ALIGN = 4; // box alignment so the half/quarter-res buffers map exactly
const PAD = Math.ceil(RIM_BLUR * 3) + ALIGN;
const BLUR = `blur(${RIM_BLUR / 2}px)`; // applied on the half-res copy

const FINE_Q = '(hover: hover) and (pointer: fine)';
const CALM_Q = '(prefers-reduced-motion: reduce)';
const canPaint = () =>
  typeof window !== 'undefined' &&
  window.matchMedia(FINE_Q).matches &&
  !window.matchMedia(CALM_Q).matches;

const WatercolorTrail: React.FC = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  const [on, setOn] = useState(canPaint);

  // Only a hovering mouse/pen paints, never under reduced motion; follow live changes.
  useEffect(() => {
    const fine = window.matchMedia(FINE_Q);
    const calm = window.matchMedia(CALM_Q);
    const sync = () => setOn(fine.matches && !calm.matches);
    fine.addEventListener('change', sync);
    calm.addEventListener('change', sync);
    return () => {
      fine.removeEventListener('change', sync);
      calm.removeEventListener('change', sync);
    };
  }, []);

  useEffect(() => {
    const vis = ref.current;
    if (!on || !vis) return;
    const wetC = document.createElement('canvas');
    const blurC = document.createElement('canvas');
    const tinyC = document.createElement('canvas');
    const atlas = document.createElement('canvas');
    const grainC = document.createElement('canvas');
    const vctx = vis.getContext('2d');
    const wctx = wetC.getContext('2d');
    const bctx = blurC.getContext('2d');
    const tctx = tinyC.getContext('2d');
    const actx = atlas.getContext('2d');
    const gctx = grainC.getContext('2d');
    if (!vctx || !wctx || !bctx || !tctx || !actx || !gctx) return;

    // ctx.filter is missing in older Safari: fall back to a 2x-down / 2x-up box blur.
    let canFilter = false;
    if ('filter' in bctx) {
      bctx.filter = 'blur(1px)';
      canFilter = bctx.filter === 'blur(1px)';
      bctx.filter = 'none';
    }

    // Paper tooth: sparse pits plus a soft tileable cloud, so the wash dries unevenly.
    // One-off 128px tile; the alpha is all that destination-out reads.
    grainC.width = grainC.height = GRAIN_TILE;
    const img = gctx.createImageData(GRAIN_TILE, GRAIN_TILE);
    const G = 8;
    const lat = new Float32Array(G * G).map(() => Math.random());
    for (let y = 0; y < GRAIN_TILE; y++) {
      const fy = (y / GRAIN_TILE) * G;
      const iy = fy | 0;
      const ty = (fy - iy) * (fy - iy) * (3 - 2 * (fy - iy));
      for (let x = 0; x < GRAIN_TILE; x++) {
        const fx = (x / GRAIN_TILE) * G;
        const ix = fx | 0;
        const tx = (fx - ix) * (fx - ix) * (3 - 2 * (fx - ix));
        const a = lat[iy * G + ix];
        const b = lat[iy * G + ((ix + 1) % G)];
        const c = lat[((iy + 1) % G) * G + ix];
        const d = lat[((iy + 1) % G) * G + ((ix + 1) % G)];
        const cloud = a + (b - a) * tx + (c - a) * ty + (a - b - c + d) * tx * ty;
        const n = Math.random();
        const pit = n > 0.78 ? (n - 0.78) / 0.22 : 0;
        img.data[(y * GRAIN_TILE + x) * 4 + 3] = Math.min(1, pit * 0.9 + Math.max(0, cloud - 0.35) * 0.55) * 255;
      }
    }
    gctx.putImageData(img, 0, 0);
    const grain = vctx.createPattern(grainC, 'repeat');

    // Irregular dab outlines: a random ellipse with a few low harmonics and vertex noise.
    const shape = new Float32Array(SHAPES * VERTS);
    for (let s = 0; s < SHAPES; s++) {
      const asp = 0.72 + Math.random() * 0.28;
      const rot = Math.random() * Math.PI;
      const p2 = Math.random() * 6.283;
      const p3 = Math.random() * 6.283;
      const p5 = Math.random() * 6.283;
      for (let v = 0; v < VERTS; v++) {
        const th = (v / VERTS) * Math.PI * 2;
        const co = Math.cos(th - rot);
        const si = Math.sin(th - rot);
        let r = asp / Math.sqrt(asp * asp * co * co + si * si) / Math.sqrt(asp);
        r *= 1 + 0.07 * Math.sin(2 * th + p2) + 0.06 * Math.sin(3 * th + p3) + 0.035 * Math.sin(5 * th + p5);
        r *= 1 + (Math.random() - 0.5) * 0.08;
        shape[s * VERTS + v] = Math.min(1.45, r);
      }
    }

    // One atlas row per pigment, pre-tinted so a dab is a single drawImage.
    const buildAtlas = () => {
      atlas.width = CELL * SHAPES;
      atlas.height = CELL * pal.cols.length;
      for (let p = 0; p < pal.cols.length; p++) {
        actx.fillStyle = pal.cols[p];
        for (let s = 0; s < SHAPES; s++) {
          const cx = s * CELL + CELL / 2;
          const cy = p * CELL + CELL / 2;
          actx.beginPath();
          for (let v = 0; v < VERTS; v++) {
            const th = (v / VERTS) * Math.PI * 2;
            const r = SR * shape[s * VERTS + v];
            if (v === 0) actx.moveTo(cx + Math.cos(th) * r, cy + Math.sin(th) * r);
            else actx.lineTo(cx + Math.cos(th) * r, cy + Math.sin(th) * r);
          }
          actx.closePath();
          actx.fill();
        }
      }
    };

    // live dabs, struct-of-arrays ring (CSS px; converted at draw time)
    const X = new Float32Array(CAP);
    const Y = new Float32Array(CAP);
    const R = new Float32Array(CAP);
    const A = new Float32Array(CAP); // strength x load x dryness
    const T = new Float32Array(CAP); // lifetime, ms
    const W = new Float32Array(CAP); // wetness 0..1, drives bleed
    const B = new Float64Array(CAP); // birth, performance.now()
    const S = new Uint8Array(CAP); // sprite shape
    const P = new Uint8Array(CAP); // pigment row
    let head = 0;
    let tail = 0;
    let count = 0;

    // canvas geometry + last frame's footprint (internal px), which is all that needs clearing
    let cw = 4;
    let ch = 4;
    let sx = RES;
    let sy = RES;
    let bx0 = 0;
    let by0 = 0;
    let bx1 = 0;
    let by1 = 0;
    let raf = 0;
    let stamp = 0; // performance.now() of the event being painted

    // stroke state
    let down = false;
    let lx = 0; // last raw sample, doubles as the quadratic control point
    let ly = 0;
    let lt = 0;
    let mx = 0; // curve start: midpoint of the previous pair
    let my = 0;
    let carry = 0; // distance since the last dab
    let along = 0; // stroke length so far
    let speed = 0; // smoothed px/s
    let accD = 0; // distance / time pooled for the next speed reading
    let accT = 0;
    let fresh = false; // touched down, first speed reading not taken yet
    let phase = 0;
    let gap = 0; // dabs left in a dry-brush skip
    let ttlJit = 1;
    // per-segment brush, set in curve()
    let cDry = 0;
    let cR = R_MAX;
    let cSp = 1;
    let cTtl = TTL_WET;
    // pigment on the brush
    let pig = 0;
    let pigPrev = 0;
    let mix = 0;
    let nextPick = 0;
    let loadDist = 0;

    const pickUp = (mid: boolean) => {
      const n = pal.cols.length - 1; // index of the rare pigment
      let next: number;
      if (pig !== n && Math.random() < RARE_P) next = n;
      else if (pig < n) {
        const r = (Math.random() * (n - 1)) | 0;
        next = r >= pig ? r + 1 : r;
      } else next = (Math.random() * n) | 0;
      pigPrev = pig;
      pig = next;
      mix = mid ? MIX_DABS : 0;
      loadDist = 0;
      // the orange is an accent: it runs out sooner
      nextPick = stamp + (PICK_MIN + Math.random() * (PICK_MAX - PICK_MIN)) * (next === n ? 0.5 : 1);
    };

    const push = (x: number, y: number, r: number, a: number, ttl: number, wet: number, p: number) => {
      X[head] = x;
      Y[head] = y;
      R[head] = r;
      A[head] = a;
      T[head] = ttl;
      W[head] = wet;
      B[head] = stamp;
      S[head] = (Math.random() * SHAPES) | 0;
      P[head] = p;
      head = (head + 1) & MASK;
      if (count === CAP) tail = (tail + 1) & MASK;
      else count++;
    };

    const dab = (x: number, y: number, ux: number, uy: number, s: number) => {
      if (gap > 0) {
        gap--;
        return;
      }
      if (Math.random() < GAP_P * cDry * cDry) {
        gap = 1 + ((Math.random() * 2) | 0);
        return;
      }
      if (stamp >= nextPick) pickUp(true);
      const taper = s >= TAPER_PX ? 1 : 0.45 + (0.55 * s) / TAPER_PX;
      const wob = 1 + WOBBLE * Math.sin(s * 0.045 + phase) + (Math.random() - 0.5) * 0.22;
      const r = cR * taper * wob;
      const j = (Math.random() - 0.5) * r * 0.4; // sideways jitter keeps the edge ragged
      const p = mix > 0 && Math.random() * MIX_DABS < mix ? pigPrev : pig;
      if (mix > 0) mix--;
      const load = LOAD_MIN + (1 - LOAD_MIN) * Math.exp(-loadDist / LOAD_FALLOFF);
      const a = pal.strength[p] * load * (1 - 0.3 * cDry) * (0.9 + Math.random() * 0.1);
      push(x - uy * j, y + ux * j, r, a, cTtl, 1 - cDry, p);
      if (Math.random() < SPECK_P * cDry) {
        const o = (Math.random() < 0.5 ? -1 : 1) * r * (1.2 + Math.random() * 0.7);
        push(x - uy * o, y + ux * o, r * (0.35 + Math.random() * 0.2), a * 0.8, cTtl, 0, p);
      }
    };

    // Stamp along a straight piece, spacing by distance and carrying the remainder over.
    const line = (x0: number, y0: number, x1: number, y1: number) => {
      const L = Math.hypot(x1 - x0, y1 - y0);
      if (L <= 0) return;
      const ux = (x1 - x0) / L;
      const uy = (y1 - y0) / L;
      let pos = 0;
      for (;;) {
        const need = Math.max(0, cSp - carry);
        if (pos + need > L) {
          carry += L - pos;
          break;
        }
        pos += need;
        carry = 0;
        dab(x0 + ux * pos, y0 + uy * pos, ux, uy, along + pos);
      }
      along += L;
      loadDist += L;
    };

    // Midpoint quadratic between samples: smooth curves even from 60Hz input.
    const curve = (ax: number, ay: number, qx: number, qy: number, bx: number, by: number) => {
      const len = (Math.hypot(qx - ax, qy - ay) + Math.hypot(bx - qx, by - qy) + Math.hypot(bx - ax, by - ay)) / 2;
      if (len <= 0) return;
      const v = Math.min(1, Math.max(0, (speed - V_SLOW) / (V_FAST - V_SLOW)));
      cDry = v * v * (3 - 2 * v);
      cR = R_MAX - (R_MAX - R_MIN) * Math.pow(cDry, 0.8);
      cSp = Math.max(1, cR * (SPACING + DRY_SPREAD * cDry));
      cTtl = (TTL_DRY + (TTL_WET - TTL_DRY) * (1 - cDry)) * ttlJit;
      const n = Math.min(24, Math.max(1, Math.ceil(len / 4)));
      let px = ax;
      let py = ay;
      for (let k = 1; k <= n; k++) {
        const t = k / n;
        const u = 1 - t;
        const x = u * u * ax + 2 * u * t * qx + t * t * bx;
        const y = u * u * ay + 2 * u * t * qy + t * t * by;
        line(px, py, x, y);
        px = x;
        py = y;
      }
    };

    const begin = (x: number, y: number, t: number) => {
      down = true;
      lx = mx = x;
      ly = my = y;
      lt = t;
      carry = 1e9; // first dab lands right where the brush touches down
      along = 0;
      speed = accD = accT = 0;
      fresh = true;
      gap = 0;
      phase = Math.random() * 6.283;
      ttlJit = 0.92 + Math.random() * 0.16;
      if (stamp >= nextPick) pickUp(false);
    };

    const sample = (x: number, y: number, t: number) => {
      if (!down) return begin(x, y, t);
      const d = Math.hypot(x - lx, y - ly);
      const dt = t - lt;
      if (d > JUMP || dt > LIFT_MS) return begin(x, y, t);
      if (d < 0.35) return;
      if (fresh) {
        // Hold the brush at touch-down until a full 8ms window has passed, then snap to
        // the real speed — otherwise a 1000Hz mouse would start every stroke as a wet blob.
        if (dt < 8) return;
        speed = (d / dt) * 1000;
        fresh = false;
      } else {
        // Speed over >= 8ms windows, so same-timestamp bursts (synthetic events, clustered
        // coalesced samples) pool their distance instead of reading as infinitely fast.
        accD += d;
        accT += Math.max(dt, 0);
        if (accT >= 8) {
          speed += ((accD / accT) * 1000 - speed) * (1 - Math.exp(-accT / SPEED_TAU));
          accD = accT = 0;
        }
      }
      const nx = (lx + x) / 2;
      const ny = (ly + y) / 2;
      curve(mx, my, lx, ly, nx, ny);
      mx = nx;
      my = ny;
      lx = x;
      ly = y;
      lt = t;
    };

    const frame = () => {
      raf = 0;
      const now = performance.now();
      // dabs are appended in time order; a dead one behind a live elder is just skipped below
      while (count > 0 && now - B[tail] >= T[tail]) {
        tail = (tail + 1) & MASK;
        count--;
      }
      if (bx1 > bx0) {
        const w = bx1 - bx0;
        const h = by1 - by0;
        vctx.clearRect(bx0, by0, w, h);
        wctx.clearRect(bx0, by0, w, h);
        bctx.clearRect(bx0 / 2, by0 / 2, w / 2, h / 2);
        bx0 = by0 = bx1 = by1 = 0;
      }
      if (count === 0) return; // bone dry: idle until the next stroke

      // 1. rebuild the wet layer from every live dab
      let x0 = cw;
      let y0 = ch;
      let x1 = 0;
      let y1 = 0;
      for (let n = 0, i = tail; n < count; n++, i = (i + 1) & MASK) {
        const age = now - B[i];
        const k = age / T[i];
        if (k >= 1) continue;
        const l = k <= HOLD ? 1 : 1 - (k - HOLD) / (1 - HOLD);
        const g = age >= BLEED_MS ? 1 : 1 - (1 - age / BLEED_MS) ** 2;
        const hs = R[i] * (1 + BLEED * W[i] * g) * sx * HALF;
        const x = X[i] * sx - hs;
        const y = Y[i] * sy - hs;
        wctx.globalAlpha = DAB_A * A[i] * l * l; // quadratic: brisk at first, gentle at the end
        wctx.drawImage(atlas, S[i] * CELL, P[i] * CELL, CELL, CELL, x, y, hs * 2, hs * 2);
        if (x < x0) x0 = x;
        if (y < y0) y0 = y;
        if (x + hs * 2 > x1) x1 = x + hs * 2;
        if (y + hs * 2 > y1) y1 = y + hs * 2;
      }
      if (x1 > x0) {
        bx0 = Math.max(0, Math.floor((x0 - PAD) / ALIGN) * ALIGN);
        by0 = Math.max(0, Math.floor((y0 - PAD) / ALIGN) * ALIGN);
        bx1 = Math.min(cw, Math.ceil((x1 + PAD) / ALIGN) * ALIGN);
        by1 = Math.min(ch, Math.ceil((y1 + PAD) / ALIGN) * ALIGN);
      }
      if (bx1 > bx0 && by1 > by0) {
        const w = bx1 - bx0;
        const h = by1 - by0;

        // 2. blurred copy at half res; its alpha is what the rim gets carved from
        if (canFilter) {
          bctx.filter = BLUR;
          bctx.drawImage(wetC, bx0, by0, w, h, bx0 / 2, by0 / 2, w / 2, h / 2);
          bctx.filter = 'none';
        } else {
          bctx.drawImage(wetC, bx0, by0, w, h, bx0 / 2, by0 / 2, w / 2, h / 2);
          tctx.clearRect(bx0 / 4, by0 / 4, w / 4, h / 4);
          tctx.drawImage(blurC, bx0 / 2, by0 / 2, w / 2, h / 2, bx0 / 4, by0 / 4, w / 4, h / 4);
          bctx.clearRect(bx0 / 2, by0 / 2, w / 2, h / 2);
          bctx.drawImage(tinyC, bx0 / 4, by0 / 4, w / 4, h / 4, bx0 / 2, by0 / 2, w / 2, h / 2);
        }

        // 3. rim = wet x (1 - blurred alpha): only survives near edges, where pigment pools
        vctx.globalAlpha = RIM_A;
        vctx.drawImage(wetC, bx0, by0, w, h, bx0, by0, w, h);
        vctx.globalCompositeOperation = 'destination-out';
        vctx.globalAlpha = 1;
        vctx.drawImage(blurC, bx0 / 2, by0 / 2, w / 2, h / 2, bx0, by0, w, h);
        // 4. body wash over it
        vctx.globalCompositeOperation = 'source-over';
        vctx.globalAlpha = BODY_A;
        vctx.drawImage(wetC, bx0, by0, w, h, bx0, by0, w, h);
        // 5. granulation: paper tooth knocks pigment out in specks (pattern is screen-anchored)
        if (grain) {
          vctx.globalCompositeOperation = 'destination-out';
          vctx.globalAlpha = GRAIN_A;
          vctx.fillStyle = grain;
          vctx.fillRect(bx0, by0, w, h);
          vctx.globalCompositeOperation = 'source-over';
        }
        // 6. wet sheen: the newest dabs read darker, then dry back to rim + wash
        for (let n = 0, i = (head - 1) & MASK; n < count; n++, i = (i - 1) & MASK) {
          const age = now - B[i];
          if (age >= DRY_MS) break;
          const q = 1 - age / DRY_MS;
          const g = age >= BLEED_MS ? 1 : 1 - (1 - age / BLEED_MS) ** 2;
          const hs = R[i] * (1 + BLEED * W[i] * g) * sx * HALF;
          vctx.globalAlpha = WET_A * A[i] * q * q;
          vctx.drawImage(atlas, S[i] * CELL, P[i] * CELL, CELL, CELL, X[i] * sx - hs, Y[i] * sy - hs, hs * 2, hs * 2);
        }
      }
      if (!document.hidden) raf = requestAnimationFrame(frame);
    };

    const kick = () => {
      if (!raf && count > 0 && !document.hidden) raf = requestAnimationFrame(frame);
    };

    const resize = () => {
      const w = Math.max(1, window.innerWidth);
      const h = Math.max(1, window.innerHeight);
      const k = Math.min(RES, Math.sqrt(MAX_PX / (w * h)));
      cw = Math.max(ALIGN, Math.ceil((w * k) / ALIGN) * ALIGN);
      ch = Math.max(ALIGN, Math.ceil((h * k) / ALIGN) * ALIGN);
      sx = cw / w;
      sy = ch / h;
      // resizing wipes every buffer; the dab list rebuilds them next frame
      vis.width = wetC.width = cw;
      vis.height = wetC.height = ch;
      blurC.width = cw / 2;
      blurC.height = ch / 2;
      if (!canFilter) {
        tinyC.width = cw / 4;
        tinyC.height = ch / 4;
      }
      // mipmapped sampling for the shrunken sprites; plain bilinear is an exact 2x2 box for the rest
      vctx.imageSmoothingQuality = 'medium';
      wctx.imageSmoothingQuality = 'medium';
      bx0 = by0 = bx1 = by1 = 0;
      kick();
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
      stamp = performance.now();
      const list = e.getCoalescedEvents?.();
      if (list && list.length) {
        for (let i = 0; i < list.length; i++) sample(list[i].clientX, list[i].clientY, list[i].timeStamp);
      } else sample(e.clientX, e.clientY, e.timeStamp);
      kick();
    };

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
        down = false;
      } else kick();
    };

    buildAtlas();
    pig = pigPrev = (Math.random() * (pal.cols.length - 1)) | 0;
    nextPick = performance.now() + PICK_MIN + Math.random() * (PICK_MAX - PICK_MIN);
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('visibilitychange', onVisibility);
      // free the offscreen backing stores now rather than at GC (StrictMode mounts twice)
      wetC.width = blurC.width = tinyC.width = atlas.width = grainC.width = 0;
    };
  }, [on]);

  return on ? (
    // multiply: the pigment darkens the paper (and the geese) like a glaze
    <canvas ref={ref} className="fixed inset-0 h-full w-full pointer-events-none mix-blend-multiply print:hidden" aria-hidden="true" />
  ) : null;
};

export default WatercolorTrail;
