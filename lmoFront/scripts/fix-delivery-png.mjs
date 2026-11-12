import { readFileSync, writeFileSync } from "node:fs";
import { PNG } from "pngjs";

const input = process.argv[2];
const output = process.argv[3] || input;
const buffer = readFileSync(input);
const png = PNG.sync.read(buffer);

for (let y = 0; y < png.height; y += 1) {
  for (let x = 0; x < png.width; x += 1) {
    const i = (png.width * y + x) << 2;
    const r = png.data[i];
    const g = png.data[i + 1];
    const b = png.data[i + 2];
    const a = png.data[i + 3];

    if (a === 0) continue;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const spread = max - min;

    const isLight = max >= 210 && spread <= 18;
    const isGray = spread <= 12 && max >= 150 && max <= 220;
    const isChecker =
      isLight ||
      isGray ||
      (r >= 190 && g >= 190 && b >= 190 && spread <= 24);

    if (isChecker) {
      png.data[i + 3] = 0;
    }
  }
}

writeFileSync(output, PNG.sync.write(png));
console.log(`Saved transparent PNG: ${output}`);
