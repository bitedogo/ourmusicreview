/** iTunes 앨범 조회·필터링·중복 제거 */

import type { AlbumDetail } from "@/src/lib/album/types";
import {
  albumAnniversaryOrdinal,
  albumTitleDedupeKey,
  albumVariantPenalty,
} from "@/src/lib/text/match";
import { createTtlCache } from "@/src/lib/utils/ttl-cache";
import {
  fetchItunesResults,
  getLargeImageUrl,
  itunesLookupUrls,
  type ItunesResult,
} from "./http";
import { asNumber, asString, normalizeName } from "./parse";

const ARTIST_CACHE_TTL_MS = 10 * 60 * 1000;

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
    const id = asNumber(first?.collectionId);
    if (id !== collectionId || !first?.collectionName || !first?.artistName) continue;

    return {
      collectionId: String(id),
      artistId: asNumber(first.artistId) != null ? String(first.artistId) : null,
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
  const id = asNumber(item.collectionId);
  if (!id) return null;
  return {
    collectionId: id,
    collectionName: String(item.collectionName ?? ""),
    artistName: String(item.artistName ?? ""),
    artworkUrl100: String(item.artworkUrl100 ?? ""),
    releaseDate: String(item.releaseDate ?? ""),
    primaryGenreName: String(item.primaryGenreName ?? ""),
    collectionType: asString(item.collectionType),
    trackCount: asNumber(item.trackCount),
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
export async function artistHasDisplayableAlbums(artistId: number): Promise<boolean> {
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
