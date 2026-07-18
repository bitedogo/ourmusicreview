/** Spotify 앨범 검색 */

import { createTtlCache } from "@/src/lib/utils/ttl-cache";
import { resolveSpotifyAlbumId } from "./resolve-album-id";

const resultCache = createTtlCache<string>(24 * 60 * 60 * 1000);

function buildSpotifyAlbumUrl(albumId: string): string {
  return `https://open.spotify.com/album/${albumId}`;
}

export async function searchSpotifyAlbumUrl(
  artist: string,
  title: string,
  options?: { collectionId?: string; releaseYear?: string }
): Promise<string | undefined> {
  const cacheKey = [
    "v2",
    options?.collectionId ?? "-",
    artist,
    title,
    options?.releaseYear ?? "-",
  ].join("::");
  const cached = resultCache.get(cacheKey);
  if (cached) return cached;

  const albumId = await resolveSpotifyAlbumId({
    artist,
    title,
    collectionId: options?.collectionId,
    releaseYear: options?.releaseYear,
  });
  if (!albumId) return undefined;

  const url = buildSpotifyAlbumUrl(albumId);
  resultCache.set(cacheKey, url);
  return url;
}
