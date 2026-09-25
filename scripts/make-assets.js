// Builds the PNGs in assets/ from assets/logo.svg.
// Run: node scripts/make-assets.js   (then npx capacitor-assets generate --ios)
const sharp = require('sharp');
const path = require('path');

const dir = path.join(__dirname, '..', 'assets');
const logo = path.join(dir, 'logo.svg');
const BG = '#15101f';

async function main() {
  await sharp(logo, { density: 300 }).resize(1024, 1024).flatten({ background: BG }).png().toFile(path.join(dir, 'icon-only.png'));

  const mark = await sharp(logo, { density: 300 }).resize(640, 640).png().toBuffer();
  for (const name of ['splash.png', 'splash-dark.png']) {
    await sharp({ create: { width: 2732, height: 2732, channels: 3, background: BG } })
      .composite([{ input: mark, gravity: 'center' }])
      .png()
      .toFile(path.join(dir, name));
  }

  await sharp(logo, { density: 300 }).resize(192, 192).png().toFile(path.join(__dirname, '..', 'www', 'icon.png'));
  console.log('Made assets/icon-only.png, splash.png, splash-dark.png and www/icon.png');
}

main().catch((e) => { console.error(e); process.exit(1); });
