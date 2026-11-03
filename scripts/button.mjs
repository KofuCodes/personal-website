// Draws my 88x31 web button pixel by pixel, in the site's palette:
//
//   npm run button
//
// My name in Newsreader on white paper, over a wide watercolour brush stroke,
// with a grey goose from the painting at its head. The loop: the goose beats its
// wings, takes off, the paint dries away, then a brush lays the stroke back in
// (and a glaze over it, and a flick of spatter) and the goose flies home.
// Writes public/button.gif (animated) and public/button.png (the resting frame,
// for anyone who linked the still). Friends' sites hotlink both paths, so keep
// them.

import sharp from 'sharp';

const W = 88;
const H = 31;
const GIF = 'public/button.gif';
const PNG = 'public/button.png';

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));

// Tailwind tokens (tailwind.config.js), plus the wash: paper through mist to the
// painting's blue-grey, lightest first
const C = {
  paper: hex('#fbfaf6'),
  paper100: hex('#f3f1ea'),
  ink300: hex('#c5cbce'),
  ink400: hex('#969ea3'),
  ink500: hex('#62696e'),
  ink700: hex('#3c4246'),
  ink900: hex('#1b1f22'),
  beak: hex('#a3541a'),
};
const WASH = ['#fbfaf6', '#eef1f2', '#e0e7ec', '#d0dbe4', '#bccbd8', '#a7b9c9', '#93a7ba'].map(hex);

const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];
// Stable per-pixel noise, so the paper grain and granulation never shimmer between frames
const noise = (x, y) => {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return n - Math.floor(n);
};

let px;
const set = (x, y, c) => {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  px.set(c, (y * W + x) * 3);
};

// Paste a sprite drawn as rows of characters; '.' is transparent
const stamp = (rows, x0, y0, colors) =>
  rows.forEach((row, y) => [...row].forEach((ch, x) => ch !== '.' && set(x0 + x, y0 + y, colors[ch])));

// --- Wash -----------------------------------------------------------------------
// One wide brush stroke, nearly the button's full height, with a darker glaze
// over its lower half and a few flecks of spatter. Pigment varies slowly through
// it and streaks along the bristles, thins in a paler bloom by the goose (ringed
// by its own crinkled line), dries to a darker tide line at the edges, and
// granulates into the odd speck. Bayer dithering mixes the tones the way the
// paint would.
const blob = (cx, cy, r, stretch, phase) => (x, y) => {
  const dx = (x - cx) / stretch;
  const dy = y - cy;
  const a = Math.atan2(dy, dx);
  return Math.hypot(dx, dy) <= r * (1 + 0.1 * Math.sin(4 * a + phase) + 0.05 * Math.sin(11 * a + 2 * phase));
};
const bloom = blob(10, 12, 5, 1.25, 2.2);
const rim = (shape, x, y) => !shape(x - 1, y) || !shape(x + 1, y) || !shape(x, y - 1) || !shape(x, y + 1);

// A horizontal brush stroke: a pressed, rounded head at x0, a wavering top and
// bottom, tapering to a dry-brushed tail at x1 where whole rows skip
const brush = (x0, x1, top, bottom, { head = 14, tail = 3, dry = 0.7 } = {}) => (x, y) => {
  if (x < x0 || x > x1) return false;
  const t = (x - x0) / (x1 - x0);
  const taper = Math.min(1, Math.sqrt(t * head), (1 - t) * tail);
  const mid = (top(x) + bottom(x)) / 2;
  if (Math.abs(y - mid) > ((bottom(x) - top(x)) / 2) * taper) return false;
  return !(t > dry && noise(y * 3 + x0, 7) < (t - dry) * 2.4);
};
const strokeTop = (x) => 5.5 + 1.3 * Math.sin(x * 0.11 + 0.3) + 0.6 * Math.sin(x * 0.43);
const strokeBottom = (x) => 27.2 + 1.1 * Math.sin(x * 0.15 + 1) + 0.5 * Math.sin(x * 0.57);
const glazeTop = (x) => 17.5 + 1.2 * Math.sin(x * 0.17 + 2);
const glazeBottom = (x) => 26 + 0.8 * Math.sin(x * 0.21);
const STROKE = brush(1, 86, strokeTop, strokeBottom);
const GLAZE = brush(5, 64, glazeTop, glazeBottom, { head: 5, tail: 2.5, dry: 0.78 });
// Flicked spatter, mostly on bare paper: x, y, strength
const SPATTER = [[69, 2, 4], [74, 4, 3], [82, 2, 4], [55, 2, 3], [29, 29, 3], [79, 29, 4], [85, 26, 3]];

// --- Laying a stroke ------------------------------------------------------------
// The brush presses down, speeds up, then slows as it lifts (smoothstep), so the
// paint reaches column x at a known moment. Its head is rounded: the middle of
// the bristles leads and the edges trail. Paint beads up just behind it, is
// darker while wet, and as it dries over DRY_MS it pales and only then pools
// into the darker tide line along the edges.
const DRY_MS = 450;
const smooth = (t) => t * t * (3 - 2 * t);
const unsmooth = (v) => {
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 24; i++) {
    const m = (lo + hi) / 2;
    if (smooth(m) < v) lo = m;
    else hi = m;
  }
  return lo;
};
const laying = (shape, x0, x1, top, bottom, ms) => (tau) => {
  if (tau == null || tau <= 0) return () => null;
  const done = tau >= ms;
  const front = x0 + (x1 - x0 + 4) * smooth(Math.min(1, tau / ms));
  return (x, y) => {
    if (!shape(x, y)) return null;
    const mid = (top(x) + bottom(x)) / 2;
    const half = Math.max(1, (bottom(x) - top(x)) / 2);
    const lag = 4 * (1 - Math.sqrt(Math.max(0, 1 - ((y - mid) / half) ** 2)));
    if (!done && x > front - lag) return null;
    const paintedAt = ms * unsmooth(Math.min(1, Math.max(0, (x - x0) / (x1 - x0))));
    return { wet: Math.max(0, 1 - (tau - paintedAt) / DRY_MS), bead: !done && x > front - lag - 2.5 };
  };
};
const STROKE_MS = 600;
const GLAZE_MS = 320;
const layStroke = laying(STROKE, 1, 86, strokeTop, strokeBottom, STROKE_MS);
const layGlaze = laying(GLAZE, 5, 64, glazeTop, glazeBottom, GLAZE_MS);

// `stroke` and `glaze` are ms since each was begun (null: not yet; Infinity:
// long dry); `fade` thins it all as it dries away
const washLevels = ({ stroke = Infinity, glaze = Infinity, spatter = true, fade = 1 }) => {
  const main = layStroke(stroke);
  const second = layGlaze(glaze);
  return (x, y) => {
    if (fade === 0) return 0;
    let p = 0;
    const a = main(x, y);
    if (a) {
      const body = 0.5 + 0.25 * Math.sin(x * 0.13 + y * 0.37) + 0.25 * Math.sin(x * 0.05 - y * 0.21 + 1.3);
      p = 0.2 + 0.18 * body;
      p += 0.07 * (noise(3, y) - 0.5) * 2; // bristle streaks, running with the stroke
      if (x < 6) p += 0.08; // extra paint where the brush pressed down
      p += 0.18 * a.wet;
      if (a.bead) p += 0.22;
      if (rim(STROKE, x, y)) p += 0.3 * (1 - a.wet);
      if (a.wet === 0 && bloom(x, y)) p += rim(bloom, x, y) ? 0.12 : -0.16;
    }
    const b = second(x, y);
    if (b) {
      p += 0.16 + 0.14 * b.wet + (b.bead ? 0.18 : 0) + (rim(GLAZE, x, y) ? 0.2 * (1 - b.wet) : 0);
    }
    if (spatter) for (const [sx, sy, s] of SPATTER) if (x === sx && y === sy) p = Math.max(p, s / 6);
    if (p === 0) return 0;
    const g = noise(x, y);
    if (g > 0.94) p += 0.16;
    else if (g < 0.04) p -= 0.12;
    return Math.max(0.02, Math.min(1, p)) * fade * (WASH.length - 1);
  };
};

// --- Name -----------------------------------------------------------------------
// Newsreader SemiBold Italic at 24px, snapped to one bit in the browser, so it is
// the site's own typeface rather than a stand-in. Ink, over a wash shadow one
// step darker than whatever lies under it.
const NAME = [
  '...............##..........####..............................',
  '.....###########...........####..............................',
  '.....####.....##............##...............................',
  '.....###.......#...........###...............................',
  '.....###.......#...###.....###...............................',
  '.....###...........###.....##................................',
  '....###....#.....#######..###..###........##..##...####..###.',
  '....###....#.....######...###.#####.....########..#####.#####',
  '....########......###.....#####.###....###..###...#.##.##.###',
  '...###....#.......###.....###...###...###...###..#..###...###',
  '...###....#.......##.....####..###...###....###....####...##.',
  '...###....#......###.....###...###...###...###.....###...###.',
  '..###........#...###.....###...###..###....###.....###...###.',
  '..###.......##...##.....###...###...###...####....###...###..',
  '..###......###..###..#..###...###.#.###..####..#..###...###.#',
  '.####.....###...#####...##....####..###########...##....####.',
  '#############...####...###...####...####..####...###...####..',
];
const NAME_X = 24;
const NAME_Y = 7;
const inName = (x, y) => NAME[y - NAME_Y]?.[x - NAME_X] === '#';

// --- Goose ----------------------------------------------------------------------
// Flying right, after the painting: grey body, dark wingtips, neck and head, a
// pale belly and an orange beak. Each pose records which row its body line is
// on, so swapping poses beats the wings around a steady body.
const GOOSE = { D: C.ink700, G: C.ink500, g: C.ink400, L: C.ink300, O: C.beak };
const POSES = {
  up: {
    body: 5,
    rows: [
      '....DD..............',
      '.....DGg............',
      '.....gGGg...........',
      '......GGGg..........',
      '......gGGGg......DD.',
      '.gGGGGGGGGGGGGDDDDDO',
      '..GGGGGGGGGGGG......',
      '...LLLLLLLLLL.......',
    ],
  },
  level: {
    body: 1,
    rows: [
      '....DGGGGGg......DD.',
      '.gGGGGGGGGGGGGDDDDDO',
      '..GGGGGGGGGGGG......',
      '...LLLLLLLLLL.......',
    ],
  },
  down: {
    body: 1,
    rows: [
      '.................DD.',
      '.gGGGGGGGGGGGGDDDDDO',
      '..GGGGGGGGGGGG......',
      '...LLLLGGGGGLL......',
      '.......gGGGg........',
      '......gGGGg.........',
      '.....gGGg...........',
      '.....DGg............',
      '....DD..............',
    ],
  },
};
const BEAT = ['up', 'level', 'down', 'level'];
const REST_X = 1; // where the goose sits at the head of the stroke (body line)
const REST_Y = 15;

// --- One frame --------------------------------------------------------------------
// Paper and wash, the name over them, the goose in front, and the frame last so
// the goose slips in and out behind its edge.
const draw = ({ goose = null, ...wash }) => {
  px = Buffer.alloc(W * H * 3);
  const level = washLevels(wash);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const l = level(x, y);
      const lo = Math.floor(l);
      if (l === 0) set(x, y, noise(x, y) < 0.06 ? C.paper100 : C.paper);
      else set(x, y, WASH[Math.min(WASH.length - 1, (l - lo) * 16 > BAYER[y % 4][x % 4] ? lo + 1 : lo)]);
    }
  }
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (inName(x, y)) set(x, y, C.ink900);
      else if (inName(x - 1, y - 1)) set(x, y, WASH[Math.min(WASH.length - 1, Math.round(level(x, y)) + 2)]);
    }
  }
  if (goose) {
    const pose = POSES[goose.pose];
    stamp(pose.rows, Math.round(goose.x), Math.round(goose.y) - pose.body, GOOSE);
  }
  for (let x = 0; x < W; x++) set(x, 0, C.ink400), set(x, H - 1, C.ink400);
  for (let y = 0; y < H; y++) set(0, y, C.ink400), set(W - 1, y, C.ink400);
  return sharp(px, { raw: { width: W, height: H, channels: 3 } }).png().toBuffer();
};

// --- The loop ---------------------------------------------------------------------
// It starts at rest, so anything that shows only the first frame shows the
// finished button. Wingbeats are slow at rest and quicker in flight.
const ease = (t) => 1 - (1 - t) ** 2;
const timeline = [];
let wing = 0;
const nextPose = () => BEAT[wing++ % BEAT.length];

// At rest at the head of the stroke, three slow wingbeats
for (let i = 0; i < 12; i++) timeline.push({ ms: 220, goose: { pose: nextPose(), x: REST_X, y: REST_Y } });
// Takes off, climbing out the top
for (let t = 1; t <= 6; t++) timeline.push({ ms: 90, goose: { pose: nextPose(), x: REST_X + t * 1.5, y: REST_Y - t * t * 0.75 } });
// The paint dries away, and the paper rests empty for a moment
timeline.push({ ms: 140, fade: 0.6 }, { ms: 140, fade: 0.3 }, { ms: 600, fade: 0 });
// The brush lays the stroke left to right; it settles as it dries; the glaze
// goes on over it and settles; then a flick of spatter
for (let tau = 50; tau <= STROKE_MS; tau += 50) timeline.push({ ms: 50, stroke: tau, glaze: null, spatter: false });
for (const [tau, ms] of [[750, 150], [950, 200], [1250, 250]]) timeline.push({ ms, stroke: tau, glaze: null, spatter: false });
for (let tau = 40; tau <= GLAZE_MS; tau += 40) timeline.push({ ms: 40, glaze: tau, spatter: false });
for (const [tau, ms] of [[500, 180], [800, 220]]) timeline.push({ ms, glaze: tau, spatter: false });
timeline.push({ ms: 160 });
// The goose flies in from the left and glides down into place
for (let i = 1; i <= 8; i++) {
  const e = ease(i / 8);
  timeline.push({ ms: 90, goose: { pose: nextPose(), x: -21 + (REST_X + 21) * e, y: REST_Y - 4 + 4 * e } });
}

const frames = await Promise.all(timeline.map(draw));
await sharp(frames, { join: { animated: true } })
  .gif({ delay: timeline.map((f) => f.ms), loop: 0, colours: 32, dither: 0, effort: 10 })
  .toFile(GIF);
await sharp(frames[0]).png({ compressionLevel: 9 }).toFile(PNG);
console.log(`wrote ${GIF} (${frames.length} frames, ${timeline.reduce((s, f) => s + f.ms, 0) / 1000}s loop) and ${PNG}`);
