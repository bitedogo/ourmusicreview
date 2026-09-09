/** iTunes 앨범 상세 조회 */

import type { AlbumDetail, AlbumDetailTrack } from "@/src/lib/album/detail-types";
import {
  albumTitleDedupeKey,
  albumVariantPenalty,
  looseMatch,
  pureAlbumTitle,
} from "@/src/lib/text/match";
import { createTtlCache } from "@/src/lib/utils/ttl-cache";
import {
  fetchItunesResults,
  getLargeImageUrl,
  isItunesKrUrl,
  itunesAlbumNameSearchUrls,
  itunesLookupUrls,
  itunesSongLookupFallbackUrls,
  type ItunesResult,
} from "./http";
import { asNumber, asString, normalizeName } from "./parse";

const detailCache = createTtlCache<AlbumDetail>(6 * 60 * 60 * 1000);
const TRACK_LOOKUP_LIMIT = 200;
const TRACK_LOOKUP_TIMEOUT_MS = 8000;
const CROSS_STORE_SEARCH_LIMIT = 25;

export interface AlbumLookupParsed {
  collection: ItunesResult | null;
  tracks: AlbumDetailTrack[];
}

export interface CrossStoreAlbumSource {
  collectionId: number | null;
  collectionName: string;
  artistName: string;
}

function mapTrack(item: ItunesResult): AlbumDetailTrack | null {
  const trackId = asNumber(item.trackId);
  const title = asString(item.trackName)?.trim();
  if (trackId == null || !title) return null;

  const explicitness = asString(item.trackExplicitness)?.toLowerCase() ?? "";
  const artistName = asString(item.artistName)?.trim();

  const previewUrl = asString(item.previewUrl)?.trim() || null;

  return {
    id: String(trackId),
    trackNumber: asNumber(item.trackNumber) ?? 0,
    discNumber: asNumber(item.discNumber) ?? 1,
    title,
    durationMs: asNumber(item.trackTimeMillis) ?? 0,
    artists: artistName ? [artistName] : [],
    explicit: explicitness === "explicit",
    previewUrl,
  };
}

export function parseAlbumLookupResults(results: ItunesResult[]): AlbumLookupParsed {
  const collection =
    results.find((item) => asString(item.wrapperType) === "collection") ?? null;
  const tracks = results
    .filter((item) => asString(item.wrapperType) === "track")
    .map(mapTrack)
    .filter((track): track is AlbumDetailTrack => Boolean(track))
    .sort((a, b) => {
      if (a.discNumber !== b.discNumber) return a.discNumber - b.discNumber;
      return a.trackNumber - b.trackNumber;
    });

  return { collection, tracks };
}

/** KR은 메타(제목·장르), 곡이 없으면 US 트랙을 씀 */
export function mergeAlbumLookups(
  kr: AlbumLookupParsed,
  us: AlbumLookupParsed,
): AlbumLookupParsed {
  return {
    collection: kr.collection ?? us.collection,
    tracks: kr.tracks.length > 0 ? kr.tracks : us.tracks,
  };
}

function artistsMatch(a: string, b: string): boolean {
  const na = normalizeName(a);
  const nb = normalizeName(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  if (na.startsWith(nb) || nb.startsWith(na)) return true;
  return looseMatch(a, b);
}

function titleKeysCompatible(sourceKey: string, candidateKey: string): "exact" | "original" | null {
  if (!sourceKey || !candidateKey) return null;
  if (sourceKey === candidateKey) return "exact";
  if (sourceKey.endsWith("__deluxe")) return null;
  if (sourceKey.endsWith("__remaster") && candidateKey === sourceKey.replace(/__remaster$/, "")) {
    return "original";
  }
  return null;
}

/** KR 전용 collectionId에 대응하는 US/GB 앨범 ID 고르기 */
export function pickCrossStoreAlbumMatch(
  source: CrossStoreAlbumSource,
  candidates: ItunesResult[],
): number | null {
  const sourceKey = albumTitleDedupeKey(source.collectionName);
  if (!sourceKey) return null;

  let bestId: number | null = null;
  let bestScore = Number.NEGATIVE_INFINITY;

  candidates.forEach((item, index) => {
    if (asString(item.wrapperType) !== "collection") return;
    const collectionId = asNumber(item.collectionId);
    const collectionName = asString(item.collectionName)?.trim() ?? "";
    const artistName = asString(item.artistName)?.trim() ?? "";
    if (collectionId == null || !collectionName || !artistName) return;
    if (source.collectionId != null && collectionId === source.collectionId) return;
    if (!artistsMatch(source.artistName, artistName)) return;

    const compatibility = titleKeysCompatible(sourceKey, albumTitleDedupeKey(collectionName));
    if (!compatibility) return;

    const penaltyGap = Math.abs(
      albumVariantPenalty(source.collectionName) - albumVariantPenalty(collectionName),
    );
    const score =
      (compatibility === "exact" ? 1000 : 100) - penaltyGap * 2 - index;

    if (score > bestScore) {
      bestScore = score;
      bestId = collectionId;
    }
  });

  return bestId;
}

function toAlbumDetail(
  collection: ItunesResult,
  tracks: AlbumDetailTrack[],
): AlbumDetail | null {
  const collectionId = asNumber(collection.collectionId);
  const name = asString(collection.collectionName)?.trim();
  const artistName = asString(collection.artistName)?.trim();
  if (collectionId == null || !name || !artistName) return null;

  const releaseDate = asString(collection.releaseDate)?.slice(0, 10) ?? "";
  const copyright = asString(collection.copyright)?.trim();
  const genre = asString(collection.primaryGenreName)?.trim() || null;

  return {
    id: String(collectionId),
    name,
    artists: [artistName],
    imageUrl: getLargeImageUrl(asString(collection.artworkUrl100)),
    releaseDate,
    releaseDatePrecision:
      releaseDate.length >= 10 ? "day" : releaseDate.length >= 7 ? "month" : "year",
    genre,
    copyrights: copyright ? [copyright] : [],
    tracks,
  };
}

async function lookupTracksByCollectionId(collectionId: number): Promise<AlbumDetailTrack[]> {
  const urls = itunesSongLookupFallbackUrls(collectionId, TRACK_LOOKUP_LIMIT);
  const lookups = await Promise.all(
    urls.map((url) => fetchItunesResults(url, { timeoutMs: TRACK_LOOKUP_TIMEOUT_MS })),
  );
  for (const results of lookups) {
    const tracks = parseAlbumLookupResults(results).tracks;
    if (tracks.length > 0) return tracks;
  }
  return [];
}

async function findCrossStoreTracks(collection: ItunesResult): Promise<AlbumDetailTrack[]> {
  const collectionName = asString(collection.collectionName)?.trim() ?? "";
  const artistName = asString(collection.artistName)?.trim() ?? "";
  if (!collectionName || !artistName) return [];

  const searchTitle = pureAlbumTitle(collectionName) || collectionName;
  const term = `${artistName} ${searchTitle}`.trim();
  const searchUrls = itunesAlbumNameSearchUrls(term, CROSS_STORE_SEARCH_LIMIT);
  const batches = await Promise.all(
    searchUrls.map((url) => fetchItunesResults(url, { timeoutMs: TRACK_LOOKUP_TIMEOUT_MS })),
  );

  const candidates: ItunesResult[] = [];
  const seen = new Set<number>();
  for (const batch of batches) {
    for (const item of batch) {
      const id = asNumber(item.collectionId);
      if (id == null || seen.has(id)) continue;
      seen.add(id);
      candidates.push(item);
    }
  }

  const matchId = pickCrossStoreAlbumMatch(
    {
      collectionId: asNumber(collection.collectionId) ?? null,
      collectionName,
      artistName,
    },
    candidates,
  );
  if (matchId == null) return [];

  return lookupTracksByCollectionId(matchId);
}

export async function getItunesAlbumDetail(
  collectionId: string,
): Promise<AlbumDetail | null> {
  const trimmed = collectionId.trim();
  if (!/^\d+$/.test(trimmed)) return null;

  const cacheKey = `itunes-v6::${trimmed}`;
  const cached = detailCache.get(cacheKey);
  if (cached) return cached;

  const urls = itunesLookupUrls(trimmed, {
    entity: "song",
    limit: TRACK_LOOKUP_LIMIT,
  });

  const lookups = await Promise.all(
    urls.map(async (url) => ({
      url,
      parsed: parseAlbumLookupResults(
        await fetchItunesResults(url, { timeoutMs: TRACK_LOOKUP_TIMEOUT_MS }),
      ),
    })),
  );

  let kr: AlbumLookupParsed = { collection: null, tracks: [] };
  let us: AlbumLookupParsed = { collection: null, tracks: [] };
  for (const { url, parsed } of lookups) {
    if (isItunesKrUrl(url)) kr = parsed;
    else us = parsed;
  }

  const merged = mergeAlbumLookups(kr, us);
  if (!merged.collection) return null;

  let tracks = merged.tracks;
  if (tracks.length === 0) {
    tracks = await findCrossStoreTracks(merged.collection);
  }

  const detail = toAlbumDetail(merged.collection, tracks);
  if (!detail) return null;

  if (detail.tracks.length > 0) {
    detailCache.set(cacheKey, detail);
  }
  return detail;
}
