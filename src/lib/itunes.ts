/** iTunes 검색·상세 공개 API 래퍼 */

import type { AlbumDetail } from "@/src/lib/album/types";
import type { ItunesArtistResult } from "@/src/lib/itunes/types";
import {
  fetchItunesResults,
  getLargeImageUrl,
  itunesArtistSearchUrls,
  itunesLookupUrls,
  type ItunesResult,
} from "@/src/lib/itunes/http";
import {
  albumAnniversaryOrdinal,
  albumTitleDedupeKey,
  albumVariantPenalty,
  normalizeForMatch,
} from "@/src/lib/text/match";
import {
  expandArtistSearchTermsForItunes,
  shareArtistAliasGroup,
} from "@/src/lib/search/artist-aliases";
import { createTtlCache } from "@/src/lib/utils/ttl-cache";

export { getLargeImageUrl };

const ARTIST_CACHE_TTL_MS = 10 * 60 * 1000;
const ARTIST_SEARCH_MAX_LIMIT = 25;

const artistSearchCache = createTtlCache<ItunesArtistResult[]>(ARTIST_CACHE_TTL_MS);
const artistArtworkCache = createTtlCache<string | null>(ARTIST_CACHE_TTL_MS);
const artistHasAlbumsCache = createTtlCache<boolean>(ARTIST_CACHE_TTL_MS);

export interface iTunesAlbum {
  collectionId: number;
  collectionName: string;
  artistName: string;
  artworkUrl100: string;
  releaseDate: string;
  primaryGenreName: string;
  collectionType?: string;
  trackCount?: number;
}

/** 팬메이드/비공식 등만 제외. remastered·live 등은 순수 제목 중복 제거로 처리 (디럭스는 별도 유지) */
const ALBUM_TITLE_FILTER_KEYWORDS = [
  "LEAK",
  "FANMADE",
  "TRIBUTE",
  "COVER",
  "PARODY",
  "BOOTLEG",
  "UNOFFICIAL",
  "FAN MADE",
  "FAN-MADE",
  "- SINGLE",
  " - SINGLE",
];

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function asFiniteNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function normalizeName(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

function releaseTime(album: iTunesAlbum): number {
  if (!album.releaseDate) return Number.POSITIVE_INFINITY;
  const time = new Date(album.releaseDate).getTime();
  return Number.isFinite(time) ? time : Number.POSITIVE_INFINITY;
}

function preferOriginalAlbum(a: iTunesAlbum, b: iTunesAlbum): iTunesAlbum {
  const penaltyA = albumVariantPenalty(a.collectionName);
  const penaltyB = albumVariantPenalty(b.collectionName);
  if (penaltyA !== penaltyB) return penaltyA < penaltyB ? a : b;

  // 10th / 20th / 30th 가 같이 있으면 더 작은(오래된) 회차 우선
  const ordinalA = albumAnniversaryOrdinal(a.collectionName);
  const ordinalB = albumAnniversaryOrdinal(b.collectionName);
  if (ordinalA != null && ordinalB != null && ordinalA !== ordinalB) {
    return ordinalA < ordinalB ? a : b;
  }
  if (ordinalA != null && ordinalB == null) return b;
  if (ordinalB != null && ordinalA == null) return a;

  const timeA = releaseTime(a);
  const timeB = releaseTime(b);
  if (timeA !== timeB) return timeA < timeB ? a : b;

  return (a.trackCount ?? 0) >= (b.trackCount ?? 0) ? a : b;
}

export async function getAlbumByCollectionId(
  collectionId: number
): Promise<AlbumDetail | null> {
  for (const url of itunesLookupUrls(collectionId)) {
    const results = await fetchItunesResults(url);
    const first = results[0];
    const id = asFiniteNumber(first?.collectionId);
    if (id !== collectionId || !first?.collectionName || !first?.artistName) continue;

    return {
      collectionId: String(id),
      artistId: asFiniteNumber(first.artistId) != null ? String(first.artistId) : null,
      title: String(first.collectionName),
      artist: String(first.artistName),
      imageUrl: getLargeImageUrl(asString(first.artworkUrl100)),
      releaseDate: asString(first.releaseDate)?.slice(0, 10) ?? "",
      genre: asString(first.primaryGenreName) ?? "",
    };
  }

  return null;
}

function isDisplayableItunesAlbum(album: iTunesAlbum): boolean {
  const trackCount = album.trackCount ?? 0;
  const collectionType = (album.collectionType ?? "").toLowerCase();
  if (trackCount <= 2) return false;
  if (collectionType === "single" && trackCount < 5) return false;

  const title = (album.collectionName || "").toUpperCase();
  return !ALBUM_TITLE_FILTER_KEYWORDS.some((keyword) => title.includes(keyword));
}

function dedupeAlbumsByTitleArtist(albums: iTunesAlbum[]): iTunesAlbum[] {
  const bestByKey = new Map<string, iTunesAlbum>();

  for (const album of albums) {
    const titleKey = albumTitleDedupeKey(album.collectionName);
    if (!titleKey) continue;
    const key = `${titleKey}_${normalizeName(album.artistName)}`;
    const existing = bestByKey.get(key);
    if (!existing) {
      bestByKey.set(key, album);
      continue;
    }
    bestByKey.set(key, preferOriginalAlbum(existing, album));
  }

  return Array.from(bestByKey.values());
}

function toItunesAlbum(item: ItunesResult): iTunesAlbum | null {
  const id = asFiniteNumber(item.collectionId);
  if (!id) return null;
  return {
    collectionId: id,
    collectionName: String(item.collectionName ?? ""),
    artistName: String(item.artistName ?? ""),
    artworkUrl100: String(item.artworkUrl100 ?? ""),
    releaseDate: String(item.releaseDate ?? ""),
    primaryGenreName: String(item.primaryGenreName ?? ""),
    collectionType: asString(item.collectionType),
    trackCount: asFiniteNumber(item.trackCount),
  };
}

export async function getArtistAlbums(
  artistId: number,
  limit: number = 50
): Promise<iTunesAlbum[]> {
  if (!Number.isFinite(artistId) || artistId <= 0) return [];

  const byId = new Map<number, iTunesAlbum>();
  for (const url of itunesLookupUrls(artistId, { limit })) {
    const results = await fetchItunesResults(url);
    for (const item of results) {
      if (item.wrapperType !== "collection") continue;
      const album = toItunesAlbum(item);
      if (album && !byId.has(album.collectionId)) {
        byId.set(album.collectionId, album);
      }
    }
  }

  const filtered = Array.from(byId.values()).filter(isDisplayableItunesAlbum);
  const deduped = dedupeAlbumsByTitleArtist(filtered);

  return deduped.sort((a, b) => {
    const timeA = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
    const timeB = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
    return timeB - timeA;
  });
}

/** 필터·중복 제거 후 표시 가능한 앨범이 하나라도 있는지 */
async function artistHasDisplayableAlbums(artistId: number): Promise<boolean> {
  if (!Number.isFinite(artistId) || artistId <= 0) return false;

  const cacheKey = String(artistId);
  const cached = artistHasAlbumsCache.get(cacheKey);
  if (cached !== undefined) return cached;

  for (const url of itunesLookupUrls(artistId, { limit: 50 })) {
    const results = await fetchItunesResults(url);
    for (const item of results) {
      if (item.wrapperType !== "collection") continue;
      const album = toItunesAlbum(item);
      if (album && isDisplayableItunesAlbum(album)) {
        artistHasAlbumsCache.set(cacheKey, true);
        return true;
      }
    }
  }

  artistHasAlbumsCache.set(cacheKey, false);
  return false;
}

async function fetchArtistArtworkUrl(
  artistId: number,
  artistName: string
): Promise<string | undefined> {
  if (!Number.isFinite(artistId) || artistId <= 0) return undefined;

  const cacheKey = String(artistId);
  const cached = artistArtworkCache.get(cacheKey);
  if (cached !== undefined) return cached ?? undefined;

  const normalizedName = artistName.trim().toLowerCase();

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

function artistNameRelevance(query: string, artistName: string): number {
  const q = normalizeForMatch(query);
  const name = normalizeForMatch(artistName);
  if (!q || !name) return 0;
  if (name === q) return 100;
  if (shareArtistAliasGroup(query, artistName)) return 95;
  if (name.startsWith(q)) return 70;
  if (name.includes(q)) return 40;
  return 0;
}

function toArtistResult(item: ItunesResult): ItunesArtistResult | null {
  const id = asFiniteNumber(item.artistId);
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

function rankArtistsByQuery(
  artists: ItunesArtistResult[],
  query: string,
): ItunesArtistResult[] {
  return artists
    .map((artist) => ({
      artist,
      score: artistNameRelevance(query, artist.artistName),
    }))
    .filter((entry) => entry.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.artist.artistName.localeCompare(b.artist.artistName),
    )
    .map((entry) => entry.artist);
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
