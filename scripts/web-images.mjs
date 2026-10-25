// Builds the web copies of every gallery photo and project image. Run after adding,
// changing or removing one:
//
//   npm run images
//
// Sources: everything under public/photography/, plus each buildImage/finishedImage in
// data/projects.ts. The originals stay the source of truth. For each it writes:
//   public/web/sm/<path>.webp  — 640px wide, for grids and cards
//   public/web/lg/<path>.webp  — up to 2000px on the long edge, for the lightbox/modal
// and records its size plus a tiny blurred preview in data/image-meta.json, so pages can
// reserve each image's exact shape and paint something before it lands
// (components/WebImage.tsx). Unchanged images are skipped; stale copies are removed.

import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const PUBLIC = 'public';
const OUT = 'public/web';
const META = 'data/image-meta.json';
const IMAGE = /\.(jpe?g|png|webp)$/i; // browsers can't show HEIC — convert those first

const sizes = {
  sm: (img) => img.resize({ width: 640, withoutEnlargement: true }).webp({ quality: 74 }),
  lg: (img) =>
    img.resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true }).webp({ quality: 80 }),
};

const walk = async (dir) =>
  (await fs.readdir(dir, { recursive: true, withFileTypes: true }))
    .filter((e) => e.isFile())
    .map((e) => path.join(e.parentPath ?? e.path, e.name));

const projectImages = [
  ...(await fs.readFile('data/projects.ts', 'utf8')).matchAll(/(?:buildImage|finishedImage):\s*'([^']+)'/g),
].map((m) => path.join(PUBLIC, m[1]));

const sources = [...(await walk(path.join(PUBLIC, 'photography'))), ...projectImages].filter((f) =>
  IMAGE.test(f)
);

const rel = (file) => path.relative(PUBLIC, file);
const toUrl = (file) => '/' + rel(file).split(path.sep).join('/');
const outFile = (file, size) => path.join(OUT, size, rel(file)).replace(/\.[^.]+$/, '.webp');

const oldMeta = JSON.parse(await fs.readFile(META, 'utf8').catch(() => '{}'));
const meta = {};
let built = 0;

const build = async (file) => {
  const url = toUrl(file);
  const { mtimeMs } = await fs.stat(file);
  const fresh = await Promise.all(
    Object.keys(sizes).map((s) => fs.stat(outFile(file, s)).then((o) => o.mtimeMs >= mtimeMs, () => false))
  );
  if (oldMeta[url] && fresh.every(Boolean)) {
    meta[url] = oldMeta[url];
    return;
  }

  // rotate() bakes in the EXIF orientation, so the copies (and their sizes) come out upright.
  const base = sharp(file).rotate();
  let w = 0;
  let h = 0;
  for (const [size, encode] of Object.entries(sizes)) {
    const dest = outFile(file, size);
    await fs.mkdir(path.dirname(dest), { recursive: true });
    const info = await encode(base.clone()).toFile(dest);
    if (size === 'lg') ({ width: w, height: h } = info);
  }
  const blur = await base.clone().resize({ width: 16 }).webp({ quality: 40 }).toBuffer();
  meta[url] = { w, h, blur: `data:image/webp;base64,${blur.toString('base64')}` };
  built++;
};

// A few at a time: sharp already spreads each decode across cores.
const queue = [...sources];
await Promise.all(
  Array.from({ length: 4 }, async () => {
    while (queue.length) await build(queue.pop());
  })
);

// Drop copies whose original is gone.
const keep = new Set(sources.flatMap((f) => Object.keys(sizes).map((s) => path.normalize(outFile(f, s)))));
let removed = 0;
for (const file of await walk(OUT).catch(() => [])) {
  if (!keep.has(path.normalize(file))) {
    await fs.rm(file);
    removed++;
  }
}

const sorted = Object.fromEntries(Object.entries(meta).sort(([a], [b]) => a.localeCompare(b)));
await fs.writeFile(META, JSON.stringify(sorted, null, 1) + '\n');
console.log(`${sources.length} images · ${built} built · ${removed} stale copies removed`);
