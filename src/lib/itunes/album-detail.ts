/** iTunes 앨범 상세 조회 */

import type { AlbumDetail, AlbumDetailTrack } from "@/src/lib/album/detail-types";
import { createTtlCache } from "@/src/lib/utils/ttl-cache";
import {
  fetchItunesResults,
  getLargeImageUrl,
  itunesLookupUrls,
  type ItunesResult,
} from "./http";

const detailCache = createTtlCache<AlbumDetail>(6 * 60 * 60 * 1000);
const TRACK_LOOKUP_LIMIT = 200;

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function mapTrack(item: ItunesResult): AlbumDetailTrack | null {
  const trackId = asNumber(item.trackId);
  const title = asString(item.trackName)?.trim();
  if (trackId == null || !title) return null;

  const explicitness = asString(item.trackExplicitness)?.toLowerCase() ?? "";
  const artistName = asString(item.artistName)?.trim();

  return {
    id: String(trackId),
    trackNumber: asNumber(item.trackNumber) ?? 0,
    discNumber: asNumber(item.discNumber) ?? 1,
    title,
    durationMs: asNumber(item.trackTimeMillis) ?? 0,
    artists: artistName ? [artistName] : [],
    explicit: explicitness === "explicit",
  };
}

function toAlbumDetail(
  collection: ItunesResult,
  tracks: AlbumDetailTrack[]
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

export async function getItunesAlbumDetail(
  collectionId: string
): Promise<AlbumDetail | null> {
  const trimmed = collectionId.trim();
  if (!/^\d+$/.test(trimmed)) return null;

  const cacheKey = `itunes-v4::${trimmed}`;
  const cached = detailCache.get(cacheKey);
  if (cached) return cached;

  let collection: ItunesResult | null = null;
  let tracks: AlbumDetailTrack[] = [];

  for (const url of itunesLookupUrls(trimmed, {
    entity: "song",
    limit: TRACK_LOOKUP_LIMIT,
  })) {
    const results = await fetchItunesResults(url);
    if (results.length === 0) continue;

    const foundCollection =
      results.find((item) => asString(item.wrapperType) === "collection") ?? null;
    const foundTracks = results
      .filter((item) => asString(item.wrapperType) === "track")
      .map(mapTrack)
      .filter((track): track is AlbumDetailTrack => Boolean(track))
      .sort((a, b) => {
        if (a.discNumber !== b.discNumber) return a.discNumber - b.discNumber;
        return a.trackNumber - b.trackNumber;
      });

    if (!foundCollection) continue;

    // KR 스토어는 collection만 주고 track을 생략하는 경우가 있어, 트랙이 있는 응답 우선
    if (foundTracks.length > 0) {
      collection = foundCollection;
      tracks = foundTracks;
      break;
    }

    if (!collection) {
      collection = foundCollection;
      tracks = foundTracks;
    }
  }

  if (!collection) return null;

  const detail = toAlbumDetail(collection, tracks);
  if (!detail) return null;

  detailCache.set(cacheKey, detail);
  return detail;
}
