/** iTunes 앨범 상세 클라이언트 fetch */

import { fetchJson } from "@/src/lib/http/client";
import type { AlbumDetailResponse } from "@/src/lib/album/detail-types";

export async function fetchItunesAlbumDetail(collectionId: string) {
  return fetchJson<AlbumDetailResponse>(
    `/api/itunes/album-detail?collectionId=${encodeURIComponent(collectionId)}`
  );
}
