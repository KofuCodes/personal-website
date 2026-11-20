// The night flock, ready for dark mode:
//
//   npm run night
//
// Mirrors the painting (scripts/art/geese-night.jpg, white geese on black) so
// the flock flies right to left, and feathers its edges out to nothing along a
// ragged line, like a wash drying unevenly, so no box edge shows. Dark mode's
// page (--paper under .dark in index.css) is this painting's own black, so the
// fade lands on the colour it came from. The brightest whites are eased down a
// little, the way the day flock's darks are, so text laid over it stays
// readable. Upscaled 2x: the source is small, and a smooth resample here beats
// the browser stretching it.
//
// Writes public/geese-night.webp. Prints the painting's black, for --paper.

import sharp from 'sharp';

const SRC = 'scripts/art/geese-night.jpg';
const OUT = 'public/geese-night.webp';

const SCALE = 2;
const KNEE = 110; // luminance above which the whites are eased...
const EASE_TOP = 0.6; // ...to this share of what's left above the knee
const FEATHER = { x: 0.15, y: 0.17 }; // fade width, as a share of each side
const RAG = 0.22; // how far the noise pushes the fade line in and out
const CELL = 70; // noise feature size, source px

const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

// Deterministic value noise in [-1, 1], so rebuilds come out identical
const noise = (() => {
  let s = 11;
  const rand = () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const G = 16;
  const lat = Array.from({ length: G * G }, () => rand() * 2 - 1);
  const at = (i, j) => lat[(((j % G) + G) % G) * G + (((i % G) + G) % G)];
  const layer = (x, y) => {
    const i = Math.floor(x);
    const j = Math.floor(y);
    const u = (x - i) * (x - i) * (3 - 2 * (x - i));
    const v = (y - j) * (y - j) * (3 - 2 * (y - j));
    const top = at(i, j) + (at(i + 1, j) - at(i, j)) * u;
    const bot = at(i, j + 1) + (at(i + 1, j + 1) - at(i, j + 1)) * u;
    return top + (bot - top) * v;
  };
  return (x, y) => (layer(x / CELL, y / CELL) * 2 + layer(x / (CELL / 2) + 31, y / (CELL / 2) + 17)) / 3;
})();

// It's greyscale already (every channel equal), so one channel carries it all
const src = await sharp(SRC).flop().extractChannel(0).raw().toBuffer({ resolveWithObject: true });
if (src.info.channels !== 1) throw new Error(`expected 1 channel, got ${src.info.channels}`);
const { width: sw, height: sh } = src.info;

// The painting's black: the darker field between the streaks
const sorted = [...src.data].sort((a, b) => a - b);
const black = sorted[Math.floor(sorted.length * 0.12)];

const { data, info } = await sharp(src.data, { raw: { width: sw, height: sh, channels: 1 } })
  .resize(sw * SCALE, sh * SCALE, { kernel: 'lanczos3' })
  .extractChannel(0) // the resize hands back three channels again
  .raw()
  .toBuffer({ resolveWithObject: true });
if (info.channels !== 1) throw new Error(`expected 1 channel, got ${info.channels}`);
const { width: W, height: H } = info;

const out = Buffer.alloc(W * H * 4);
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const i = y * W + x;
    let v = data[i];
    if (v > KNEE) v = KNEE + (v - KNEE) * EASE_TOP;
    // Distance in from the nearest edges, rounded at the corners, with the
    // fade line pushed in and out by noise
    const ex = Math.max(0, 1 - Math.min(x, W - 1 - x) / W / FEATHER.x);
    const ey = Math.max(0, 1 - Math.min(y, H - 1 - y) / H / FEATHER.y);
    const inside = 1 - Math.hypot(ex, ey);
    const a = smooth(0, 1, inside + RAG * noise(x / SCALE, y / SCALE) * (1 - inside)) * smooth(0, 0.02, inside);
    out[i * 4] = out[i * 4 + 1] = out[i * 4 + 2] = Math.round(v);
    out[i * 4 + 3] = Math.round(a * 255);
  }
}

await sharp(out, { raw: { width: W, height: H, channels: 4 } })
  .webp({ quality: 80, alphaQuality: 90, effort: 6 })
  .toFile(OUT);

console.log(`${W}x${H} → ${OUT} · the painting's black: rgb(${black}, ${black}, ${black})`);
