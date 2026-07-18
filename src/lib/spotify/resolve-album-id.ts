/** 앨범명으로 Spotify album ID 해석 */

import { looseMatch, normalizeForMatch } from "@/src/lib/text/match";
import { createTtlCache } from "@/src/lib/utils/ttl-cache";
import { spotifyFetch } from "./client";

const MARKET = "KR";
const SEARCH_LIMIT = 10;
const ARTIST_ALBUMS_LIMIT = 10;
const ODESLI_API = "https://api.song.link/v1-alpha.1/links";
const idCache = createTtlCache<string>(6 * 60 * 60 * 1000);

interface SpotifySearchAlbum {
  id: string;
  name: string;
  album_type?: string;
  release_date?: string;
  artists?: { name?: string }[];
}

interface ResolveAlbumIdInput {
  artist: string;
  title: string;
  collectionId?: string;
  releaseYear?: string;
}

function isNumericItunesId(id: string): boolean {
  return /^\d+$/.test(id);
}

function isLikelySpotifyId(id: string): boolean {
  return /^[a-zA-Z0-9]{22}$/.test(id);
}

function extractSpotifyAlbumId(url: string | null | undefined): string | null {
  if (!url) return null;
  const match = url.match(/open\.spotify\.com\/album\/([a-zA-Z0-9]+)/i);
  return match?.[1] ?? null;
}

function escapeSpotifyQuery(value: string): string {
  return value.replace(/"/g, "").trim();
}

function scoreAlbumCandidate(
  album: SpotifySearchAlbum,
  title: string,
  artist: string,
  releaseYear?: string
): number {
  const titleNorm = normalizeForMatch(album.name ?? "");
  const targetTitle = normalizeForMatch(title);
  if (!titleNorm || !targetTitle) return -1;

  let titleScore = 0;
  if (titleNorm === targetTitle) titleScore = 100;
  else if (titleNorm.includes(targetTitle) || targetTitle.includes(titleNorm)) titleScore = 45;
  else return -1;

  const targetArtist = normalizeForMatch(artist);
  const artistNames = (album.artists ?? [])
    .map((item) => normalizeForMatch(item.name ?? ""))
    .filter(Boolean);
  if (!targetArtist || artistNames.length === 0) return -1;

  let artistScore = 0;
  if (artistNames.some((name) => name === targetArtist)) artistScore = 100;
  else if (
    artistNames.some(
      (name) => name.includes(targetArtist) || targetArtist.includes(name)
    )
  ) {
    artistScore = 45;
  } else {
    return -1;
  }

  let typeScore = 0;
  if (album.album_type === "album") typeScore = 25;
  else if (album.album_type === "compilation") typeScore = 10;
  else if (album.album_type === "single") typeScore = 5;

  let yearScore = 0;
  if (releaseYear && album.release_date?.startsWith(releaseYear)) {
    yearScore = 30;
  }

  // Prefer original releases over deluxe/anniversary/remaster variants
  const rawName = album.name ?? "";
  let variantPenalty = 0;
  if (/\b(deluxe|remaster(?:ed)?|anniversary|expanded|edition|super\s*deluxe|bonus)\b/i.test(rawName)) {
    variantPenalty = -40;
  }
  if (normalizeForMatch(rawName) === normalizeForMatch(title) && !/[(\[]/.test(rawName)) {
    variantPenalty += 15;
  }

  return titleScore + artistScore + typeScore + yearScore + variantPenalty;
}

function pickBestAlbumId(
  items: SpotifySearchAlbum[],
  title: string,
  artist: string,
  releaseYear?: string
): string | null {
  let bestId: string | null = null;
  let bestScore = -1;

  for (const album of items) {
    if (!album.id) continue;
    const score = scoreAlbumCandidate(album, title, artist, releaseYear);
    if (score > bestScore) {
      bestScore = score;
      bestId = album.id;
    }
  }

  // Require at least loose title + artist match (45+45)
  return bestScore >= 90 ? bestId : null;
}

async function resolveViaOdesli(collectionId: string): Promise<string | null> {
  const sourceUrl = `https://music.apple.com/kr/album/id/${collectionId}`;
  try {
    const response = await fetch(
      `${ODESLI_API}?url=${encodeURIComponent(sourceUrl)}&userCountry=KR`,
      { cache: "no-store", headers: { Accept: "application/json" } }
    );
    if (!response.ok) return null;
    const data = (await response.json()) as {
      linksByPlatform?: { spotify?: { url?: string } };
    };
    return extractSpotifyAlbumId(data.linksByPlatform?.spotify?.url);
  } catch {
    return null;
  }
}

async function searchAlbums(query: string): Promise<SpotifySearchAlbum[]> {
  const data = await spotifyFetch<{ albums?: { items?: SpotifySearchAlbum[] } }>(
    `/search?q=${encodeURIComponent(query)}&type=album&market=${MARKET}&limit=${SEARCH_LIMIT}`
  );
  return data?.albums?.items ?? [];
}

async function resolveViaArtistAlbums(
  artist: string,
  title: string,
  releaseYear?: string
): Promise<string | null> {
  const artistQuery = escapeSpotifyQuery(artist);
  if (!artistQuery) return null;

  const artistData = await spotifyFetch<{
    artists?: { items?: { id?: string; name?: string }[] };
  }>(
    `/search?q=${encodeURIComponent(artistQuery)}&type=artist&market=${MARKET}&limit=5`
  );

  const artistItems = artistData?.artists?.items ?? [];
  const matchedArtist =
    artistItems.find((item) => looseMatch(item.name ?? "", artist)) ??
    artistItems.find((item) => normalizeForMatch(item.name ?? "") === normalizeForMatch(artist));

  if (!matchedArtist?.id) return null;

  const albums: SpotifySearchAlbum[] = [];
  let path:
    | string
    | null = `/artists/${encodeURIComponent(matchedArtist.id)}/albums?include_groups=album,single,compilation&market=${MARKET}&limit=${ARTIST_ALBUMS_LIMIT}`;

  while (path && albums.length < 200) {
    const page: {
      items?: SpotifySearchAlbum[];
      next?: string | null;
    } | null = await spotifyFetch(path);
    if (!page) break;
    albums.push(...(page.items ?? []));
    path = page.next
      ? page.next.replace("https://api.spotify.com/v1", "")
      : null;
  }

  return pickBestAlbumId(albums, title, artist, releaseYear);
}

async function resolveViaSearch(
  artist: string,
  title: string,
  releaseYear?: string
): Promise<string | null> {
  const safeArtist = escapeSpotifyQuery(artist);
  const safeTitle = escapeSpotifyQuery(title);
  if (!safeArtist || !safeTitle) return null;

  const queries = [
    `album:"${safeTitle}" artist:"${safeArtist}"`,
    `"${safeTitle}" "${safeArtist}"`,
    `${safeArtist} ${safeTitle}`,
  ];

  for (const query of queries) {
    const items = await searchAlbums(query);
    const matched = pickBestAlbumId(items, title, artist, releaseYear);
    if (matched) return matched;
  }

  return null;
}

export async function resolveSpotifyAlbumId(
  input: ResolveAlbumIdInput
): Promise<string | null> {
  const artist = input.artist.trim();
  const title = input.title.trim();
  const collectionId = input.collectionId?.trim() ?? "";
  const releaseYear = input.releaseYear?.trim().slice(0, 4) || undefined;

  const cacheKey = [
    "v3",
    collectionId || "-",
    artist.toLowerCase(),
    title.toLowerCase(),
    releaseYear || "-",
  ].join("::");
  const cached = idCache.get(cacheKey);
  if (cached) return cached;

  let albumId: string | null = null;

  if (collectionId && isLikelySpotifyId(collectionId)) {
    albumId = collectionId;
  } else if (collectionId && isNumericItunesId(collectionId)) {
    albumId = await resolveViaOdesli(collectionId);
  }

  if (!albumId && artist && title) {
    albumId = await resolveViaArtistAlbums(artist, title, releaseYear);
  }

  if (!albumId && artist && title) {
    albumId = await resolveViaSearch(artist, title, releaseYear);
  }

  if (albumId) idCache.set(cacheKey, albumId);
  return albumId;
}
