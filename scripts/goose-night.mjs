// Lifts the swimming goose off its paper for dark mode:
//
//   npm run goose
//
// Watercolour on white can't just be keyed out: its whites (the cheek strap,
// the chest) are bare paper too. So the paper goes transparent by how far each
// pixel sits from the paper colour, keeping the pixel's own colour, so the pale
// washes turn into a light mist over the dark page rather than dark stains,
// and the goose's silhouette is traced by hand and held opaque, so its whites
// stay white. The top, right and bottom edges feather out (the goose rises
// off the bottom of the screen as you scroll); the left runs off the screen
// (GooseNight.tsx pins it to that corner).
//
// Reads scripts/art/goose.jpg, writes public/goose-night.webp.

import sharp from 'sharp';

const SRC = 'scripts/art/goose.jpg';
const OUT = 'public/goose-night.webp';

// The goose, in source pixels: beak tip, over the head and down the back to
// the tail, then back along the waterline and up the chest and throat.
const GOOSE = [
  [114, 191], [130, 168], [148, 134], [169, 116], [195, 113], [215, 124],
  [237, 160], [255, 202], [265, 242], [278, 262], [320, 264], [380, 262],
  [440, 270], [500, 287], [570, 304], [640, 314], [684, 319], [660, 331],
  [600, 346], [560, 368], [515, 386], [460, 392], [390, 391], [310, 388],
  [230, 384], [180, 380], [163, 366], [156, 340], [157, 312], [165, 288],
  [182, 266], [200, 250], [196, 222], [186, 192], [170, 184], [150, 186],
  [128, 191],
];

const WASH_FLOOR = 0.035; // paper texture and JPEG noise sit below this
const WASH_GAIN = 1.15;
const WASH_MAX = 0.66;
// Where the washes thin out: a lopsided oval around the goose, in source px.
// Tight on the right, top and bottom, so the streaks behind the tail and the
// drips under the reflection are gone well before the sheet's edge (anything
// left there would stop in a hard line, and the bottom shows once the goose
// rises on scroll); loose on the left, which runs off the screen. The boundary
// is pushed in and out by low-frequency noise, so each streak dies away at
// its own point, like a wash drying unevenly, instead of all along one line.
const FADE = {
  cx: 420, cy: 380,
  right: 285, left: 470, top: 300, bottom: 330,
  from: 0.6, to: 1, // fully there inside `from`, gone past `to`
  rag: 0.14, // how far the noise moves the boundary, as a fraction of it
  cell: 90, // noise feature size, px
};

// Deterministic value noise in [-1, 1], so rebuilds come out identical
const noise = (() => {
  let s = 7;
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
    const fx = x - i;
    const fy = y - j;
    const u = fx * fx * (3 - 2 * fx);
    const v = fy * fy * (3 - 2 * fy);
    const top = at(i, j) + (at(i + 1, j) - at(i, j)) * u;
    const bot = at(i, j + 1) + (at(i + 1, j + 1) - at(i, j + 1)) * u;
    return top + (bot - top) * v;
  };
  return (x, y) => (layer(x / FADE.cell, y / FADE.cell) * 2 + layer(x / (FADE.cell / 2) + 31, y / (FADE.cell / 2) + 17)) / 3;
})();

const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

// Separable box blur on a Float32 plane; three passes approximate a gaussian.
const blur = (src, w, h, r, passes = 3) => {
  let a = src;
  let b = new Float32Array(a.length);
  const n = 2 * r + 1;
  for (let p = 0; p < passes; p++) {
    for (let y = 0; y < h; y++) {
      let acc = 0;
      for (let x = -r; x <= r; x++) acc += a[y * w + Math.min(w - 1, Math.max(0, x))];
      for (let x = 0; x < w; x++) {
        b[y * w + x] = acc / n;
        acc += a[y * w + Math.min(w - 1, x + r + 1)] - a[y * w + Math.max(0, x - r)];
      }
    }
    [a, b] = [b, a];
    for (let x = 0; x < w; x++) {
      let acc = 0;
      for (let y = -r; y <= r; y++) acc += a[Math.min(h - 1, Math.max(0, y)) * w + x];
      for (let y = 0; y < h; y++) {
        b[y * w + x] = acc / n;
        acc += a[Math.min(h - 1, y + r + 1) * w + x] - a[Math.max(0, y - r) * w + x];
      }
    }
    [a, b] = [b, a];
  }
  return a;
};

const inside = (px, py, poly) => {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
};

const { data, info } = await sharp(SRC).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H } = info;
const N = W * H;

// Paper colour: the bright end of each channel (most of the sheet is bare)
const paper = [0, 1, 2].map((c) => {
  const v = new Uint8Array(N);
  for (let i = 0; i < N; i++) v[i] = data[i * 3 + c];
  v.sort();
  return v[Math.floor(N * 0.93)];
});

// How much pigment sits on each pixel: the strongest channel's drop below paper
const ink = new Float32Array(N);
for (let i = 0; i < N; i++) {
  let d = 0;
  for (let c = 0; c < 3; c++) d = Math.max(d, (paper[c] - data[i * 3 + c]) / paper[c]);
  ink[i] = Math.max(0, d);
}
const inkSoft = blur(ink, W, H, 1, 1); // knocks out JPEG speckle in the bare paper

const body = new Float32Array(N);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) body[y * W + x] = inside(x + 0.5, y + 0.5, GOOSE) ? 1 : 0;
// Shrunk ~4px before softening, so the soft edge lands on the painted edge
// instead of dragging a rim of bare paper out with it
const shrunk = blur(body, W, H, 2).map((v) => smooth(0.8, 1, v));
const bodySoft = blur(shrunk, W, H, 2);

const out = Buffer.alloc(N * 4);
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const i = y * W + x;
    // The washes thin out into the page along a ragged oval (FADE). The thin
    // edge terms only make certain the last pixel row/column is empty.
    const dx = x - FADE.cx;
    const dy = y - FADE.cy;
    const r = Math.hypot(dx / (dx > 0 ? FADE.right : FADE.left), dy / (dy < 0 ? FADE.top : FADE.bottom));
    const fade =
      (1 - smooth(FADE.from, FADE.to, r * (1 + FADE.rag * noise(x, y)))) *
      smooth(0, 0.04, (W - 1 - x) / W) *
      smooth(0, 0.04, y / H) *
      smooth(0, 0.04, (H - 1 - y) / H) *
      smooth(0, 0.02, x / W);
    // Opacity follows the pigment, so a faint wash stays faint on the dark page
    const wash = Math.min(WASH_MAX, Math.max(0, inkSoft[i] - WASH_FLOOR) * WASH_GAIN) * smooth(0, 0.06, inkSoft[i] - WASH_FLOOR);
    const a = Math.max(wash * fade, bodySoft[i]);
    out[i * 4] = data[i * 3];
    out[i * 4 + 1] = data[i * 3 + 1];
    out[i * 4 + 2] = data[i * 3 + 2];
    out[i * 4 + 3] = Math.round(a * 255);
  }
}

await sharp(out, { raw: { width: W, height: H, channels: 4 } })
  .webp({ quality: 82, alphaQuality: 90, effort: 6 })
  .toFile(OUT);

console.log(`paper rgb(${paper.join(', ')}) → ${OUT}`);
