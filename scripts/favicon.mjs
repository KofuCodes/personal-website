// Draws the browser-tab icon from the goose taking off:
//
//   npm run favicon
//
// A square crop around the goose, wingtips to tail, tight so it still reads at 16px, resampled
// with a touch of sharpening (watercolour goes soft when shrunk). The tab icon
// gets rounded corners (public/favicon.png); the home-screen icon stays square
// (public/apple-touch-icon.png), since iOS rounds icons itself and would fill
// transparent corners with black.

import sharp from 'sharp';

const SRC = 'scripts/art/favicon.webp';
const CROP = { left: 140, top: 35, width: 450, height: 450 }; // source px: wingtips, head and tail all in
const RADIUS = 0.22; // corner radius, as a share of the side

const square = (size) =>
  sharp(SRC).extract(CROP).resize(size, size, { kernel: 'lanczos3' }).sharpen({ sigma: 0.6 });

const tab = 64; // shown at 16-32px, so crisp on high-density screens too
const r = Math.round(tab * RADIUS);
const corners = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${tab}" height="${tab}"><rect width="${tab}" height="${tab}" rx="${r}" ry="${r}"/></svg>`
);
await square(tab).ensureAlpha().composite([{ input: corners, blend: 'dest-in' }]).png().toFile('public/favicon.png');
await square(180).png().toFile('public/apple-touch-icon.png');

console.log('public/favicon.png (64px, rounded) · public/apple-touch-icon.png (180px)');
