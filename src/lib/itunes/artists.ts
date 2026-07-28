/** iTunes 아티스트 검색 */

import { expandArtistSearchTermsForItunes } from "@/src/lib/search/artist-aliases";
import { createTtlCache } from "@/src/lib/utils/ttl-cache";
import { artistHasDisplayableAlbums } from "./albums";
import {
  fetchItunesResults,
  itunesArtistSearchUrls,
  itunesLookupUrls,
  type ItunesResult,
} from "./http";
import { asNumber, asString, normalizeName } from "./parse";
import { rankArtistsByQuery } from "./rank";
import type { ItunesArtistResult } from "./types";

const ARTIST_CACHE_TTL_MS = 10 * 60 * 1000;
const ARTIST_SEARCH_MAX_LIMIT = 25;

const artistSearchCache = createTtlCache<ItunesArtistResult[]>(ARTIST_CACHE_TTL_MS);
const artistArtworkCache = createTtlCache<string | null>(ARTIST_CACHE_TTL_MS);

async function fetchArtistArtworkUrl(
  artistId: number,
  artistName: string
): Promise<string | undefined> {
  if (!Number.isFinite(artistId) || artistId <= 0) return undefined;

  const cacheKey = String(artistId);
  const cached = artistArtworkCache.get(cacheKey);
  if (cached !== undefined) return cached ?? undefined;

  const normalizedName = normalizeName(artistName);

  for (const url of itunesLookupUrls(artistId, { limit: 10 })) {
    const results = await fetchItunesResults(url);
    const albums = results.filter(
      (item) =>
        item.wrapperType === "collection" &&
        typeof item.artworkUrl100 === "string" &&
        normalizeName(item.artistName) === normalizedName
    );

    const preferred =
      albums.find((item) => String(item.collectionType ?? "").toLowerCase() === "album") ??
      albums[0];
    const artwork = asString(preferred?.artworkUrl100);
    if (artwork) {
      artistArtworkCache.set(cacheKey, artwork);
      return artwork;
    }
  }

  artistArtworkCache.set(cacheKey, null);
  return undefined;
}

function toArtistResult(item: ItunesResult): ItunesArtistResult | null {
  const id = asNumber(item.artistId);
  const artistName = asString(item.artistName);
  if (id == null || !artistName?.trim()) return null;
  return {
    artistId: String(id),
    artistName,
    artistViewUrl: asString(item.artistLinkUrl),
    primaryGenreName: asString(item.primaryGenreName),
  };
}

async function collectArtistCandidates(
  searchTerms: string[],
  candidateLimit: number,
): Promise<ItunesArtistResult[]> {
  const byId = new Map<string, ItunesArtistResult>();

  for (const searchTerm of searchTerms) {
    for (const url of itunesArtistSearchUrls(searchTerm, candidateLimit)) {
      const results = await fetchItunesResults(url);
      for (const item of results) {
        const artist = toArtistResult(item);
        if (!artist || byId.has(artist.artistId)) continue;
        byId.set(artist.artistId, artist);
      }
    }
  }

  return [...byId.values()];
}

async function takeArtistsWithAlbums(
  ranked: ItunesArtistResult[],
  limit: number,
): Promise<ItunesArtistResult[]> {
  const visible: ItunesArtistResult[] = [];
  const BATCH_SIZE = 8;

  for (let i = 0; i < ranked.length && visible.length < limit; i += BATCH_SIZE) {
    const batch = ranked.slice(i, i + BATCH_SIZE);
    const checked = await Promise.all(
      batch.map(async (artist) => ({
        artist,
        hasAlbums: await artistHasDisplayableAlbums(Number(artist.artistId)),
      })),
    );
    for (const entry of checked) {
      if (visible.length >= limit) break;
      if (entry.hasAlbums) visible.push(entry.artist);
    }
  }

  return visible;
}

async function withArtistArtwork(
  artists: ItunesArtistResult[],
): Promise<ItunesArtistResult[]> {
  return Promise.all(
    artists.map(async (artist) => {
      const artworkUrl100 = await fetchArtistArtworkUrl(
        Number(artist.artistId),
        artist.artistName,
      );
      return artworkUrl100 ? { ...artist, artworkUrl100 } : artist;
    }),
  );
}

export async function searchArtists(
  term: string,
  limit: number = 20,
): Promise<ItunesArtistResult[]> {
  const trimmed = term.trim();
  if (!trimmed) return [];

  const cappedLimit = Math.min(Math.max(limit, 1), ARTIST_SEARCH_MAX_LIMIT);
  const cacheKey = `v5_alias_${trimmed.toLowerCase()}_${cappedLimit}`;
  const cached = artistSearchCache.get(cacheKey);
  if (cached) return cached;

  const candidateLimit = Math.min(
    ARTIST_SEARCH_MAX_LIMIT,
    Math.max(cappedLimit * 3, cappedLimit),
  );

  const candidates = await collectArtistCandidates(
    expandArtistSearchTermsForItunes(trimmed),
    candidateLimit,
  );
  const ranked = rankArtistsByQuery(candidates, trimmed);
  const withAlbums = await takeArtistsWithAlbums(ranked, cappedLimit);
  const results = await withArtistArtwork(withAlbums);

  if (results.length > 0) {
    artistSearchCache.set(cacheKey, results);
  }
  return results;
}

export interface SearchArtistsForApiOptions {
  limit?: number;
}

/** 공백/빈 검색어를 정규화한 뒤 아티스트를 검색하는 API 핸들러 공용 로직 */
export async function searchArtistsForApi(
  query: string,
  options?: SearchArtistsForApiOptions,
): Promise<ItunesArtistResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  return searchArtists(trimmed, options?.limit);
}
