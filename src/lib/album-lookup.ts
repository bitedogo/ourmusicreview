/** 앨범 ID·메타 룩업 헬퍼 */

import type { AlbumDetail } from "@/src/lib/album/types";
import { getAlbumByCollectionId } from "@/src/lib/itunes";

export async function getAlbumById(id: string): Promise<AlbumDetail | null> {
  const trimmed = id.trim();
  if (!/^\d+$/.test(trimmed)) return null;

  const numericId = parseInt(trimmed, 10);
  if (!Number.isFinite(numericId) || numericId <= 0) return null;

  return getAlbumByCollectionId(numericId);
}
