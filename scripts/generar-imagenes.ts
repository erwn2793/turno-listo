import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const WIDTH = 2400;
const HEIGHT = 1350;
const outputDir = path.join(process.cwd(), "public", "imagenes");

type Rgb = { r: number; g: number; b: number };

const images: { fileName: string; from: Rgb; to: Rgb }[] = [
  {
    fileName: "portada-local.png",
    from: { r: 15, g: 118, b: 110 },
    to: { r: 19, g: 78, b: 74 },
  },
  {
    fileName: "equipo-atencion.png",
    from: { r: 180, g: 83, b: 9 },
    to: { r: 120, g: 53, b: 15 },
  },
  {
    fileName: "calendario-citas.png",
    from: { r: 91, g: 33, b: 182 },
    to: { r: 15, g: 118, b: 110 },
  },
];

async function writeImage(fileName: string, from: Rgb, to: Rgb) {
  const pixels = Buffer.alloc(WIDTH * HEIGHT * 3);

  for (let y = 0; y < HEIGHT; y += 1) {
    const mixY = y / (HEIGHT - 1);
    for (let x = 0; x < WIDTH; x += 1) {
      const mix = (x / (WIDTH - 1)) * 0.7 + mixY * 0.3;
      const index = (y * WIDTH + x) * 3;
      pixels[index] = clamp(from.r + (to.r - from.r) * mix);
      pixels[index + 1] = clamp(from.g + (to.g - from.g) * mix);
      pixels[index + 2] = clamp(from.b + (to.b - from.b) * mix);
    }
  }

  await sharp(pixels, { raw: { width: WIDTH, height: HEIGHT, channels: 3 } })
    .png({ compressionLevel: 0 })
    .toFile(path.join(outputDir, fileName));
}

function clamp(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });
  for (const image of images) {
    await writeImage(image.fileName, image.from, image.to);
    const filePath = path.join(outputDir, image.fileName);
    const size = fs.statSync(filePath).size;
    console.log(`${image.fileName}: ${WIDTH}px, ${size} bytes`);
  }
}

main();
