/** 홈화면/PWA용 흰 바탕 ORU 아이콘 생성
 *
 * Usage:
 *   node scripts/generate-oru-app-icons.mjs
 *   node scripts/generate-oru-app-icons.mjs 0.65
 *
 * 인자 = 캔버스 대비 로고 가로 비율 (기본 0.65 ≈ 기존 대비 1.5배).
 * 소스: public/icons/oru-app-icon-source.png 가 있으면 우선, 없으면 512 아이콘.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const iconsDir = path.join(root, "public", "icons");

const SOURCE_CANDIDATES = [
  path.join(iconsDir, "oru-app-icon-source.png"),
  path.join(iconsDir, "oru-app-icon-512.png"),
];
const WIDTH_RATIO = Number(process.argv[2] ?? "0.65");

async function contentBounds(filePath) {
  const { data, info } = await sharp(filePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let minX = info.width;
  let minY = info.height;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const i = (y * info.width + x) * info.channels;
      const a = data[i + 3];
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const isWhite = a < 8 || (r > 248 && g > 248 && b > 248);
      if (!isWhite) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  return {
    left: minX,
    top: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  };
}

async function makeIcon(size, outPath, logoBuf, logoAspect) {
  const targetW = Math.round(size * WIDTH_RATIO);
  const targetH = Math.max(1, Math.round(targetW / logoAspect));
  const resized = await sharp(logoBuf)
    .resize(targetW, targetH, { fit: "fill", kernel: "lanczos3" })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 3,
      background: "#ffffff",
    },
  })
    .composite([{ input: resized, gravity: "centre" }])
    .png()
    .toFile(outPath);

  console.log(
    `wrote ${path.relative(root, outPath)} (${size}, logo ${targetW}x${targetH})`,
  );
}

async function main() {
  if (!(WIDTH_RATIO > 0 && WIDTH_RATIO <= 1)) {
    throw new Error("width ratio must be between 0 and 1");
  }

  const source = SOURCE_CANDIDATES.find((p) => fs.existsSync(p));
  if (!source) {
    throw new Error("No source icon found");
  }

  const bounds = await contentBounds(source);
  const logoBuf = await sharp(source).extract(bounds).png().toBuffer();
  const logoAspect = bounds.width / bounds.height;

  console.log(`source ${path.relative(root, source)}, widthRatio=${WIDTH_RATIO}`);
  await makeIcon(512, path.join(iconsDir, "oru-app-icon-512.png"), logoBuf, logoAspect);
  await makeIcon(192, path.join(iconsDir, "oru-app-icon-192.png"), logoBuf, logoAspect);
  await makeIcon(192, path.join(iconsDir, "oru-favicon.png"), logoBuf, logoAspect);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
