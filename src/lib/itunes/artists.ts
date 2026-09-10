/** iTunes 아티스트 검색 */

import { expandArtistSearchTermsForItunes } from "@/src/lib/search/artist-aliases";
import { createTtlCache } from "@/src/lib/utils/ttl-cache";
import { artistHasDisplayableAlbums } from "./albums";
import {
  fetchItunesOutcome,
  fetchItunesResults,
  isItunesCoolingDown,
  isItunesKrUrl,
  itunesArtistSearchUrls,
  itunesLookupUrls,
  itunesSongSearchUrls,
  type ItunesResult,
} from "./http";
import { asNumber, asString, normalizeName } from "./parse";
import {
  artistNameRelevance,
  emptyCatalogSignals,
  rankArtistsByQuery,
  SONG_ARTIST_MATCH_MIN,
  type ArtistCatalogSignals,
} from "./rank";
import type { ItunesArtistResult } from "./types";

const ARTIST_CACHE_TTL_MS = 10 * 60 * 1000;
const ARTIST_SEARCH_MAX_LIMIT = 25;
const STRONG_NAME_MATCH = 90;

const artistSearchCache = createTtlCache<ItunesArtistResult[]>(ARTIST_CACHE_TTL_MS);
const artistArtworkCache = createTtlCache<string | null>(ARTIST_CACHE_TTL_MS);
const inflightSearches = new Map<string, Promise<ItunesArtistResult[]>>();

function hasUniqueStrongMatch(
  artists: Iterable<ItunesArtistResult>,
  query: string,
): boolean {
  const strongIds = new Set<string>();
  for (const artist of artists) {
    if (artistNameRelevance(query, artist.artistName) < STRONG_NAME_MATCH) continue;
    strongIds.add(artist.artistId);
    if (strongIds.size > 1) return false;
  }
  return strongIds.size === 1;
}

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

function mergeArtist(
  byId: Map<string, ItunesArtistResult>,
  incoming: ItunesArtistResult,
) {
  const existing = byId.get(incoming.artistId);
  if (!existing) {
    byId.set(incoming.artistId, incoming);
    return;
  }
  byId.set(incoming.artistId, {
    ...existing,
    artistViewUrl: existing.artistViewUrl ?? incoming.artistViewUrl,
    primaryGenreName: existing.primaryGenreName ?? incoming.primaryGenreName,
    artworkUrl100: existing.artworkUrl100 ?? incoming.artworkUrl100,
  });
}

function recordSignal(
  signalsById: Map<string, ArtistCatalogSignals>,
  artistId: string,
  patch: Partial<ArtistCatalogSignals>,
) {
  const current = signalsById.get(artistId) ?? emptyCatalogSignals();
  signalsById.set(artistId, {
    songHits: current.songHits + (patch.songHits ?? 0),
    songFirstIndex: Math.min(
      current.songFirstIndex,
      patch.songFirstIndex ?? Number.POSITIVE_INFINITY,
    ),
    usArtistIndex: Math.min(
      current.usArtistIndex,
      patch.usArtistIndex ?? Number.POSITIVE_INFINITY,
    ),
  });
}

async function collectArtistCandidates(
  originalQuery: string,
  searchTerms: string[],
  candidateLimit: number,
): Promise<{
  byId: Map<string, ItunesArtistResult>;
  signalsById: Map<string, ArtistCatalogSignals>;
}> {
  const byId = new Map<string, ItunesArtistResult>();
  const signalsById = new Map<string, ArtistCatalogSignals>();

  for (const searchTerm of searchTerms) {
    for (const url of itunesArtistSearchUrls(searchTerm, candidateLimit)) {
      const outcome = await fetchItunesOutcome(url);
      const fromUsCatalog = !isItunesKrUrl(url);
      outcome.results.forEach((item, index) => {
        const artist = toArtistResult(item);
        if (!artist) return;
        mergeArtist(byId, artist);
        if (fromUsCatalog) {
          recordSignal(signalsById, artist.artistId, { usArtistIndex: index });
        }
      });
      if (hasUniqueStrongMatch(byId.values(), originalQuery)) break;
    }
    if (hasUniqueStrongMatch(byId.values(), originalQuery)) break;
  }

  return { byId, signalsById };
}

async function collectSongSignals(
  term: string,
  limit: number,
): Promise<{
  byId: Map<string, ItunesArtistResult>;
  signalsById: Map<string, ArtistCatalogSignals>;
}> {
  const byId = new Map<string, ItunesArtistResult>();
  const signalsById = new Map<string, ArtistCatalogSignals>();

  for (const url of itunesSongSearchUrls(term, limit)) {
    const results = await fetchItunesResults(url);
    let matchedHits = 0;

    results.forEach((item, index) => {
      const artist = toArtistResult(item);
      if (!artist) return;
      if (artistNameRelevance(term, artist.artistName) < SONG_ARTIST_MATCH_MIN) {
        return;
      }
      matchedHits += 1;
      mergeArtist(byId, artist);
      recordSignal(signalsById, artist.artistId, {
        songHits: 1,
        songFirstIndex: index,
      });
    });

    if (matchedHits > 0) break;
  }

  return { byId, signalsById };
}

async function takeArtistsWithAlbums(
  ranked: ItunesArtistResult[],
  limit: number,
): Promise<ItunesArtistResult[]> {
  const visible: ItunesArtistResult[] = [];

  for (const artist of ranked) {
    if (visible.length >= limit) break;
    if (await artistHasDisplayableAlbums(Number(artist.artistId))) {
      visible.push(artist);
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

export interface SearchArtistsOptions {
  limit?: number;
  /** 자동완성: 앨범·아트워크 추가 조회를 생략해 iTunes 호출을 줄인다 */
  light?: boolean;
}

async function searchArtistsUncached(
  trimmed: string,
  cappedLimit: number,
  light: boolean,
): Promise<ItunesArtistResult[]> {
  if (isItunesCoolingDown()) return [];

  const candidateLimit = Math.min(
    ARTIST_SEARCH_MAX_LIMIT,
    Math.max(cappedLimit * 3, cappedLimit),
  );

  const searchTerms = expandArtistSearchTermsForItunes(trimmed);
  const artistCollected = await collectArtistCandidates(
    trimmed,
    searchTerms,
    candidateLimit,
  );

  const byId = artistCollected.byId;
  const signalsById = artistCollected.signalsById;

  if (!hasUniqueStrongMatch(byId.values(), trimmed)) {
    const songCollected = await collectSongSignals(trimmed, candidateLimit);
    for (const artist of songCollected.byId.values()) {
      mergeArtist(byId, artist);
    }
    for (const [artistId, signals] of songCollected.signalsById) {
      recordSignal(signalsById, artistId, signals);
    }
  }

  const ranked = rankArtistsByQuery([...byId.values()], trimmed, signalsById);
  const visible = light
    ? ranked.slice(0, cappedLimit)
    : await takeArtistsWithAlbums(ranked, cappedLimit);
  const results = light ? visible : await withArtistArtwork(visible);

  return results;
}

export async function searchArtists(
  term: string,
  limit: number | SearchArtistsOptions = 20,
): Promise<ItunesArtistResult[]> {
  const options: SearchArtistsOptions =
    typeof limit === "number" ? { limit } : limit;
  const trimmed = term.trim();
  if (!trimmed) return [];

  const cappedLimit = Math.min(Math.max(options.limit ?? 20, 1), ARTIST_SEARCH_MAX_LIMIT);
  const light = Boolean(options.light);
  const cacheKey = `v8_${light ? "light" : "full"}_${trimmed.toLowerCase()}_${cappedLimit}`;
  const cached = artistSearchCache.get(cacheKey);
  if (cached) return cached;

  const inflight = inflightSearches.get(cacheKey);
  if (inflight) return inflight;

  const pending = searchArtistsUncached(trimmed, cappedLimit, light)
    .then((results) => {
      if (results.length > 0) artistSearchCache.set(cacheKey, results);
      return results;
    })
    .finally(() => {
      inflightSearches.delete(cacheKey);
    });

  inflightSearches.set(cacheKey, pending);
  return pending;
}

export function resetArtistSearchStateForTests() {
  artistSearchCache.clear();
  artistArtworkCache.clear();
  inflightSearches.clear();
}

export interface SearchArtistsForApiOptions extends SearchArtistsOptions {}

/** 공백/빈 검색어를 정규화한 뒤 아티스트를 검색하는 API 핸들러 공용 로직 */
export async function searchArtistsForApi(
  query: string,
  options?: SearchArtistsForApiOptions,
): Promise<ItunesArtistResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  return searchArtists(trimmed, options);
}
