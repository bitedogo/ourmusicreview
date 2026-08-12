/** 유저 미디어 업로드 (이미지 압축 + R2) */

import sharp from "sharp";
import { putPublicObject } from "@/src/lib/storage/r2";

const IMAGE_MAX_SIZE = 400;
const IMAGE_WEBP_QUALITY = 85;
const CACHE_CONTROL = "public, max-age=31536000";

async function compressImageBytes(bytes: ArrayBuffer): Promise<Buffer> {
  return sharp(Buffer.from(bytes))
    .rotate()
    .resize(IMAGE_MAX_SIZE, IMAGE_MAX_SIZE, {
      fit: "cover",
      withoutEnlargement: true,
    })
    .webp({ quality: IMAGE_WEBP_QUALITY })
    .toBuffer();
}

function randomSuffix(): string {
  return Math.random().toString(36).slice(2);
}

async function uploadCompressedWebp(
  key: string,
  file: File,
  failLabel: string
): Promise<string> {
  const compressed = await compressImageBytes(await file.arrayBuffer());
  try {
    return await putPublicObject({
      key,
      body: compressed,
      contentType: "image/webp",
      cacheControl: CACHE_CONTROL,
    });
  } catch (error) {
    throw new Error(
      `${failLabel}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function uploadProfileImage(
  file: File,
  prefix: string
): Promise<string> {
  const key = `${prefix}/${Date.now()}_${randomSuffix()}.webp`;
  return uploadCompressedWebp(key, file, "프로필 이미지 업로드 실패");
}

export async function uploadPlaylistCoverImage(file: File): Promise<string> {
  const key = `playlists/${Date.now()}_${randomSuffix()}.webp`;
  return uploadCompressedWebp(key, file, "플레이리스트 대표사진 업로드 실패");
}
