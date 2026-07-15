import { unstable_cache } from "next/cache";
import { fetchItunesResults, itunesLookupUrls } from "@/src/lib/itunes/http";
import { searchSpotifyAlbumUrl } from "@/src/lib/spotify/album-search";
import { looseMatch, normalizeForMatch } from "@/src/lib/text/match";
import type { AlbumStreamingLinks } from "./types";

const ODESLI_API = "https://api.song.link/v1-alpha.1/links";
const DEEZER_SEARCH_API = "https://api.deezer.com/search/album";

const FETCH_JSON = {
  headers: { Accept: "application/json" as const },
};

function buildSearchTerm(artist: string, title: string): string {
  return `${artist} ${title}`.trim();
}

function buildAppleMusicFallbackUrl(collectionId: number): string {
  return `https://music.apple.com/kr/album/id/${collectionId}`;
}

function pickUrl(value: unknown): string | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;
  return value;
}

interface ItunesAlbumInfo {
  appleMusicUrl: string;
  title: string;
  artist: string;
}

async function lookupItunesAlbum(collectionId: number): Promise<ItunesAlbumInfo> {
  for (const url of itunesLookupUrls(collectionId)) {
    const results = await fetchItunesResults(url);
    const first = results[0];
    const collectionViewUrl = pickUrl(first?.collectionViewUrl);
    if (collectionViewUrl) {
      return {
        appleMusicUrl: collectionViewUrl,
        title: String(first?.collectionName ?? ""),
        artist: String(first?.artistName ?? ""),
      };
    }
  }

  return {
    appleMusicUrl: buildAppleMusicFallbackUrl(collectionId),
    title: "",
    artist: "",
  };
}

interface DeezerAlbum {
  title?: string;
  link?: string;
  artist?: { name?: string };
}

async function searchDeezerAlbumUrl(
  artist: string,
  title: string
): Promise<string | undefined> {
  const query = buildSearchTerm(artist, title);
  if (!query) return undefined;

  try {
    const response = await fetch(
      `${DEEZER_SEARCH_API}?q=${encodeURIComponent(query)}&limit=10`,
      FETCH_JSON
    );
    if (!response.ok) return undefined;

    const data = (await response.json()) as { data?: DeezerAlbum[] };
    const targetArtist = normalizeForMatch(artist);
    const matched = (data.data ?? []).find(
      (album) =>
        looseMatch(album.title ?? "", title) &&
        !!targetArtist &&
        looseMatch(album.artist?.name ?? "", artist)
    );

    return pickUrl(matched?.link);
  } catch {
    return undefined;
  }
}

interface OdesliResponse {
  linksByPlatform?: Record<string, { url?: string }>;
}

async function fetchOdesliLinks(sourceUrl: string): Promise<AlbumStreamingLinks> {
  try {
    const response = await fetch(
      `${ODESLI_API}?url=${encodeURIComponent(sourceUrl)}&userCountry=KR`,
      FETCH_JSON
    );
    if (!response.ok) return {};

    const data = (await response.json()) as OdesliResponse;
    const platforms = data.linksByPlatform ?? {};
    return {
      appleMusic: pickUrl(platforms.appleMusic?.url ?? platforms.itunes?.url),
      spotify: pickUrl(platforms.spotify?.url),
      youtubeMusic: pickUrl(platforms.youtubeMusic?.url),
    };
  } catch {
    return {};
  }
}

async function fetchItunesAlbumLinks(numericId: number): Promise<AlbumStreamingLinks> {
  const { appleMusicUrl, title, artist } = await lookupItunesAlbum(numericId);
  const hasMeta = Boolean(artist && title);

  const [odesli, spotifySearch, deezer] = await Promise.all([
    fetchOdesliLinks(appleMusicUrl),
    hasMeta
      ? searchSpotifyAlbumUrl(artist, title, { collectionId: String(numericId) })
      : Promise.resolve(undefined),
    hasMeta ? searchDeezerAlbumUrl(artist, title) : Promise.resolve(undefined),
  ]);

  const links: AlbumStreamingLinks = { appleMusic: appleMusicUrl };
  const spotify = odesli.spotify ?? spotifySearch;
  if (spotify) links.spotify = spotify;
  if (odesli.youtubeMusic) links.youtubeMusic = odesli.youtubeMusic;
  if (deezer) links.deezer = deezer;
  return links;
}

async function fetchAlbumStreamingLinks(albumId: string): Promise<AlbumStreamingLinks> {
  const trimmed = albumId.trim();
  if (!/^\d+$/.test(trimmed)) return {};

  const numericId = Number(trimmed);
  if (!Number.isFinite(numericId) || numericId <= 0) return {};

  return fetchItunesAlbumLinks(numericId);
}

function getCachedAlbumStreamingLinks(collectionId: string) {
  return unstable_cache(
    async () => fetchAlbumStreamingLinks(collectionId),
    [`album-streaming-links-v8-${collectionId}`],
    { revalidate: 60 * 60 * 24 * 30 }
  )();
}

export async function getAlbumStreamingLinks(
  collectionId: string
): Promise<AlbumStreamingLinks> {
  return getCachedAlbumStreamingLinks(collectionId);
}

export async function getBatchAlbumStreamingLinks(
  collectionIds: string[]
): Promise<Record<string, AlbumStreamingLinks>> {
  const uniqueIds = Array.from(new Set(collectionIds));
  const entries = await Promise.all(
    uniqueIds.map(async (collectionId) => {
      const links = await getAlbumStreamingLinks(collectionId);
      return [collectionId, links] as const;
    })
  );

  return Object.fromEntries(entries);
}
