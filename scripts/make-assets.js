// Builds the icon and splash PNGs in assets/ from assets/logo.png.
// Run: npm run assets   (this script, then capacitor-assets for iOS)
//
// assets/logo.png must be a square PNG (1024x1024 or larger) whose background
// is a plain colour or a top-to-bottom gradient. The splash screen reuses the
// logo's lettering on a full-screen version of that background.
const sharp = require('sharp');
const path = require('path');

const root = path.join(__dirname, '..');
const dir = path.join(root, 'assets');
const SIZE = 1024;
const SPLASH = 2732;

function hex(r, g, b) {
  return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
}

async function main() {
  const logo = sharp(path.join(dir, 'logo.png')).resize(SIZE, SIZE).removeAlpha();
  const { data } = await logo.clone().raw().toBuffer({ resolveWithObject: true });
  const at = (x, y) => { const i = (y * SIZE + x) * 3; return [data[i], data[i + 1], data[i + 2]]; };

  // App icon: the logo as-is (no transparency allowed).
  await logo.clone().png().toFile(path.join(dir, 'icon-only.png'));

  // Lift the lettering off the background: each row's background colour is
  // its left-most pixel, and anything that differs from it becomes ink.
  const ink = Buffer.alloc(SIZE * SIZE * 4);
  let minX = SIZE, minY = SIZE, maxX = 0, maxY = 0;
  for (let y = 0; y < SIZE; y++) {
    const bg = at(2, y);
    for (let x = 0; x < SIZE; x++) {
      const p = at(x, y);
      const diff = Math.max(...p.map((v, k) => Math.abs(v - bg[k])));
      const a = Math.min(1, Math.max(0, (diff - 6) / 90));
      const o = (y * SIZE + x) * 4;
      for (let k = 0; k < 3; k++) {
        ink[o + k] = a > 0 ? Math.max(0, Math.min(255, Math.round(bg[k] + (p[k] - bg[k]) / a))) : 0;
      }
      ink[o + 3] = Math.round(a * 255);
      if (a > 0.3) { minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); }
    }
  }
  const pad = 24;
  const box = { left: minX - pad, top: minY - pad, width: maxX - minX + 2 * pad, height: maxY - minY + 2 * pad };
  const lettering = await sharp(ink, { raw: { width: SIZE, height: SIZE, channels: 4 } })
    .extract(box).png().toBuffer();

  // Splash: full-screen background gradient with the lettering in the middle.
  const top = hex(...at(2, 2));
  const bottom = hex(...at(2, SIZE - 3));
  const bgSvg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${SPLASH}" height="${SPLASH}">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/>` +
    `<stop offset="1" stop-color="${bottom}"/></linearGradient></defs>` +
    `<rect width="100%" height="100%" fill="url(#g)"/></svg>`
  );
  const mark = await sharp(lettering).resize({ width: 900 }).png().toBuffer();
  for (const name of ['splash.png', 'splash-dark.png']) {
    await sharp(bgSvg).composite([{ input: mark, gravity: 'center' }]).flatten({ background: top })
      .png().toFile(path.join(dir, name));
  }

  // Small copies for the bundled offline screen.
  await logo.clone().resize(192, 192).png().toFile(path.join(root, 'www', 'icon.png'));

  console.log(`Made icon-only.png, splash.png, splash-dark.png (background ${top} -> ${bottom})`);
}

main().catch((e) => { console.error(e); process.exit(1); });
