// Draws the browser-tab icon from the goose portrait (a head in profile on pink):
//
//   npm run favicon
//
// A square crop of the whole head, beak tip included, so its black head and
// white cheek still read as a goose at 16px, resampled with a touch of
// sharpening (brushwork goes soft when shrunk this far). The tab icon
// gets rounded corners (public/favicon.png); the home-screen icon stays square
// (public/apple-touch-icon.png), since iOS rounds icons itself and would fill
// transparent corners with black.

import sharp from 'sharp';

const SRC = 'scripts/art/favicon.jpg';
const CROP = { left: 130, top: 104, width: 1100, height: 1100 }; // source px: crown to the bottom edge, back of the neck to the beak tip
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
