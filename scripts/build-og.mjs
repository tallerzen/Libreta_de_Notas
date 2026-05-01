// Genera /public/og-image.png (1200x630) a partir de /public/og-image.svg.
// Correr con `npm run og:build`. Requerido cada vez que se cambie el SVG fuente.
import sharp from 'sharp';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const svgPath = resolve(root, 'public/og-image.svg');
const pngPath = resolve(root, 'public/og-image.png');

const svg = await readFile(svgPath);

const png = await sharp(svg, { density: 144 })
  .resize(1200, 630, { fit: 'fill' })
  .png({ compressionLevel: 9 })
  .toBuffer();

await writeFile(pngPath, png);
console.log(`og-image.png generado: ${png.length} bytes (${(png.length / 1024).toFixed(1)} KB)`);
