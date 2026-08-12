/** 즐겨찾기 API 클라이언트 */

import { fetchJson } from "@/src/lib/http/client";
import type { FavoritesResponse } from "@/src/lib/search/types";

export interface AddFavoriteInput {
  albumId: string;
  albumTitle: string;
  albumArtist: string;
  albumImageUrl?: string | null;
  albumReleaseDate?: string | null;
}

export async function fetchFavoritesApi<
  T = FavoritesResponse["data"]
>() {
  return fetchJson<{ ok: true; data: T }>("/api/favorites");
}

export async function addFavoriteApi(input: AddFavoriteInput) {
  return fetchJson<{ ok: true }>("/api/favorites", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function removeFavoriteApi(albumId: string) {
  return fetchJson<{ ok: true }>("/api/favorites", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ albumId }),
  });
}
