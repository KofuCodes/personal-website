// Draws my 88x31 web button pixel by pixel, in the site's palette:
//
//   npm run button
//
// A watercolour sky (dithered, pooling into the darker rim a wash dries to at its
// edge), geese from the painting beating their wings across it, and my name in a
// small pixel serif. Writes public/button.gif (animated) and public/button.png
// (its first frame, for anyone who linked the still). Friends' sites hotlink
// both paths, so keep them.

import sharp from 'sharp';

const W = 88;
const H = 31;
const GIF = 'public/button.gif';
const PNG = 'public/button.png';
const FRAME_MS = 220; // a slow, soft wingbeat: one full stroke a little under a second

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));

// Tailwind tokens (tailwind.config.js), plus the sky: two wash tones and a rim
// mixed from paper toward the blue-grey of the painting's wash
const C = {
  paper: hex('#fbfaf6'),
  wash1: hex('#dfe6ec'),
  wash2: hex('#c6d2dd'),
  rim: hex('#97abbe'),
  ink300: hex('#c5cbce'),
  ink400: hex('#969ea3'),
  ink500: hex('#62696e'),
  ink700: hex('#3c4246'),
  ink900: hex('#1b1f22'),
  beak: hex('#a3541a'),
};

let px = Buffer.alloc(W * H * 3);
const set = (x, y, c) => {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  px.set(c, (y * W + x) * 3);
};

// Paste a sprite drawn as rows of characters; '.' is transparent
const stamp = (rows, x0, y0, colors) =>
  rows.forEach((row, y) => [...row].forEach((ch, x) => ch !== '.' && set(x0 + x, y0 + y, colors[ch])));

for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) set(x, y, C.paper);

// --- Sky wash ---------------------------------------------------------------
// Pigment sits heavy at the top, thins out, then pools again just above the
// ragged bottom edge, which dries to a darker rim, the way a wash does on paper.
// Each change of tone gets one checkered row, so the bands blend like wet paint.
const edge = (x) => Math.round(13 + 1.6 * Math.sin(x * 0.19 + 0.5) + 0.9 * Math.sin(x * 0.53 + 2));
const checker = (x, y, a, b) => ((x + y) % 2 ? a : b);

for (let x = 1; x < W - 1; x++) {
  const b = edge(x);
  for (let y = 1; y < b; y++) {
    if (y <= 2 || y === b - 1) set(x, y, C.wash2);
    else if (y === 3 || y === b - 2) set(x, y, checker(x, y, C.wash2, C.wash1));
    else set(x, y, C.wash1);
  }
  set(x, b, C.rim);
}

// --- Name ---------------------------------------------------------------------
// A bold pixel serif standing in for Newsreader: 8px caps, 5px x-height,
// 2px stems, 1px hairlines and feet
const FONT = {
  E: ['#######', '.##...#', '.##....', '.#####.', '.##....', '.##....', '.##...#', '#######'],
  T: ['########', '#..##..#', '...##...', '...##...', '...##...', '...##...', '...##...', '..####..'],
  t: ['.....', '.##..', '.##..', '####.', '.##..', '.##..', '.##.#', '..##.'],
  h: ['###.....', '.##.....', '.##.....', '.#####..', '.##..##.', '.##..##.', '.##..##.', '###..###'],
  a: ['.......', '.......', '.......', '.####..', '....##.', '.#####.', '##..##.', '.######'],
  n: ['........', '........', '........', '######..', '.##..##.', '.##..##.', '.##..##.', '###..###'],
  r: ['......', '......', '......', '##.###', '.###..', '.##...', '.##...', '####..'],
  ' ': ['...'],
};

const text = (s, y0, color) => {
  const width = [...s].reduce((w, ch) => w + FONT[ch][0].length + 1, -1);
  let x = Math.round((W - width) / 2);
  for (const ch of s) {
    stamp(FONT[ch], x, y0, { '#': color });
    x += FONT[ch][0].length + 1;
  }
};

text('Ethan Tran', 19, C.ink900);

// --- Frame --------------------------------------------------------------------
for (let x = 0; x < W; x++) set(x, 0, C.ink400), set(x, H - 1, C.ink400);
for (let y = 0; y < H; y++) set(0, y, C.ink400), set(W - 1, y, C.ink400);

// --- Geese --------------------------------------------------------------------
// Flying right, after the painting: grey body, dark wingtips, neck and head, a
// pale belly and an orange beak. Each pose records which row its body line is
// on, so swapping poses beats the wings while the body holds still.
const GOOSE = { D: C.ink700, G: C.ink500, g: C.ink400, L: C.ink300, O: C.beak };
const POSES = {
  up: {
    body: 4,
    rows: [
      '...DD..........',
      '....DGg........',
      '....gGGg.......',
      '.....GGGg...DD.',
      '.gGGGGGGGGDDDDO',
      '..GGGGGGGGG....',
      '...LLLLLLL.....',
    ],
  },
  level: {
    body: 1,
    rows: [
      '...DGGGg....DD.',
      '.gGGGGGGGGDDDDO',
      '..GGGGGGGGG....',
      '...LLLLLLL.....',
    ],
  },
  down: {
    body: 1,
    rows: [
      '............DD.',
      '.gGGGGGGGGDDDDO',
      '..GGGGGGGGG....',
      '...LLLGGGgL....',
      '.....gGGg......',
      '....gGGg.......',
      '...DGg.........',
    ],
  },
};
const BEAT = ['up', 'level', 'down', 'level'];

// Body-line positions, each goose a different point in the beat so the flock
// never flaps in unison
const FLOCK = [
  { x: 7, y: 6, phase: 0 },
  { x: 35, y: 5, phase: 2 },
  { x: 63, y: 5, phase: 1 },
];

const sky = Buffer.from(px);
const frames = [];
for (let f = 0; f < BEAT.length; f++) {
  px = Buffer.from(sky);
  for (const goose of FLOCK) {
    const pose = POSES[BEAT[(f + goose.phase) % BEAT.length]];
    stamp(pose.rows, goose.x, goose.y - pose.body, GOOSE);
  }
  frames.push(await sharp(px, { raw: { width: W, height: H, channels: 3 } }).png().toBuffer());
}

await sharp(frames, { join: { animated: true } })
  .gif({ delay: frames.map(() => FRAME_MS), loop: 0, colours: 16, dither: 0, effort: 10 })
  .toFile(GIF);
await sharp(frames[0]).png({ compressionLevel: 9 }).toFile(PNG);
console.log(`wrote ${GIF} (${frames.length} frames) and ${PNG}`);
