import { looseMatch } from "@/src/lib/text/match";
import { createTtlCache } from "@/src/lib/utils/ttl-cache";
import { getSpotifyAccessToken } from "./token";

const API_BASE = "https://api.spotify.com/v1";
const MARKET = "KR";
const SEARCH_LIMIT = 10;

const resultCache = createTtlCache<string>(24 * 60 * 60 * 1000);

interface SpotifySearchAlbum {
  id: string;
  name: string;
  artists?: { name?: string }[];
  external_urls?: { spotify?: string };
}

async function spotifyFetch<T>(path: string, attempt = 0): Promise<T | null> {
  const token = await getSpotifyAccessToken();
  if (!token) return null;

  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (response.status === 429 && attempt < 1) {
    const retryAfter = Number(response.headers.get("Retry-After") ?? "0");
    if (retryAfter > 0 && retryAfter <= 3) {
      await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
      return spotifyFetch(path, attempt + 1);
    }
    return null;
  }

  if (!response.ok) return null;
  return (await response.json()) as T;
}

function buildSpotifyAlbumUrl(albumId: string): string {
  return `https://open.spotify.com/album/${albumId}`;
}

export async function searchSpotifyAlbumUrl(
  artist: string,
  title: string
): Promise<string | undefined> {
  const cacheKey = `${artist}::${title}`;
  const cached = resultCache.get(cacheKey);
  if (cached) return cached;

  const query = `${artist} ${title}`.trim();
  if (!query) return undefined;

  const data = await spotifyFetch<{ albums?: { items?: SpotifySearchAlbum[] } }>(
    `/search?q=${encodeURIComponent(query)}&type=album&market=${MARKET}&limit=${SEARCH_LIMIT}`
  );

  const items = data?.albums?.items ?? [];
  const matched =
    items.find(
      (album) =>
        looseMatch(album.name ?? "", title) &&
        looseMatch(album.artists?.[0]?.name ?? "", artist)
    ) ?? items[0];

  const url =
    matched?.external_urls?.spotify ??
    (matched?.id ? buildSpotifyAlbumUrl(matched.id) : undefined);

  if (url) resultCache.set(cacheKey, url);
  return url;
}
