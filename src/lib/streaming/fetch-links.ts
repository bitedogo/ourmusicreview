/** 스트리밍 플랫폼 링크 수집 */

import { unstable_cache } from "next/cache";
import { fetchItunesResults, itunesLookupUrls } from "@/src/lib/itunes/http";
import { searchSpotifyAlbumUrl } from "@/src/lib/spotify/album-search";
import type { AlbumStreamingLinks } from "./types";
import {
  fetchOdesliPlatformLinks,
  pickStreamingUrl,
  searchDeezerUrl,
} from "./provider-http";

const ODESLI_API = "https://api.song.link/v1-alpha.1/links";
const DEEZER_SEARCH_API = "https://api.deezer.com/search/album";

function buildAppleMusicFallbackUrl(collectionId: number): string {
  return `https://music.apple.com/kr/album/id/${collectionId}`;
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
    const collectionViewUrl = pickStreamingUrl(first?.collectionViewUrl);
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

async function searchDeezerAlbumUrl(
  artist: string,
  title: string
): Promise<string | undefined> {
  return searchDeezerUrl({ endpoint: DEEZER_SEARCH_API, artist, title });
}

async function fetchOdesliLinks(sourceUrl: string): Promise<AlbumStreamingLinks> {
  return fetchOdesliPlatformLinks(
    `${ODESLI_API}?url=${encodeURIComponent(sourceUrl)}&userCountry=KR`
  );
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
