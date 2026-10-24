/** iTunes 곡 검색·조회 결과를 댓글 추천 스냅샷으로 맞춘다 */

import type { CommentTrackData } from "@/src/components/interaction/comment-types";
import {
  fetchItunesOutcome,
  fetchItunesResults,
  getLargeImageUrl,
  itunesLookupUrls,
  itunesSongLookupFallbackUrls,
  itunesSongSearchUrls,
  isItunesCoolingDown,
  type ItunesResult,
} from "@/src/lib/itunes/http";
import { asNumber, asString } from "@/src/lib/itunes/parse";

const SONG_SEARCH_LIMIT = 8;
const APPLE_PREVIEW_HOSTS = new Set([
  "audio-ssl.itunes.apple.com",
  "audio.itunes.apple.com",
]);

export function sanitizePreviewUrl(value: unknown): string | null {
  const raw = asString(value)?.trim();
  if (!raw || raw.length > 1000) return null;

  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") return null;
    if (url.username || url.password) return null;
    if (!APPLE_PREVIEW_HOSTS.has(url.hostname)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function sanitizeArtworkUrl(value: unknown): string | null {
  const raw = asString(value)?.trim();
  const large = getLargeImageUrl(raw);
  if (!large || large.length > 1000) return null;

  try {
    const url = new URL(large);
    if (url.protocol !== "https:") return null;
    if (!url.hostname.endsWith(".mzstatic.com")) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function mapItunesSong(item: ItunesResult): CommentTrackData | null {
  const wrapperType = asString(item.wrapperType);
  if (wrapperType && wrapperType !== "track") return null;

  const kind = asString(item.kind);
  if (kind && kind !== "song") return null;

  const trackId = asNumber(item.trackId);
  const trackName = asString(item.trackName)?.trim();
  const artistName = asString(item.artistName)?.trim();
  if (trackId == null || !trackName || !artistName) return null;

  const collectionId = asNumber(item.collectionId);
  const collectionName = asString(item.collectionName)?.trim() || null;

  return {
    trackId: String(trackId),
    trackName: trackName.slice(0, 500),
    artistName: artistName.slice(0, 255),
    collectionId: collectionId != null ? String(collectionId) : null,
    collectionName: collectionName ? collectionName.slice(0, 500) : null,
    artworkUrl: sanitizeArtworkUrl(item.artworkUrl100),
    previewUrl: sanitizePreviewUrl(item.previewUrl),
  };
}

/** 앞쪽 배치가 이긴다. 같은 곡 번호는 한 번만 남긴다. */
export function mergeSongResults(
  batches: ItunesResult[][],
  limit = SONG_SEARCH_LIMIT
): CommentTrackData[] {
  const byId = new Map<string, CommentTrackData>();

  for (const batch of batches) {
    for (const item of batch) {
      const track = mapItunesSong(item);
      if (!track || byId.has(track.trackId)) continue;
      byId.set(track.trackId, track);
      if (byId.size >= limit) return [...byId.values()];
    }
  }

  return [...byId.values()];
}

export async function searchSongsForComment(term: string): Promise<{
  tracks: CommentTrackData[];
  throttled: boolean;
}> {
  const trimmed = term.trim();
  if (trimmed.length < 2) return { tracks: [], throttled: false };
  if (isItunesCoolingDown()) return { tracks: [], throttled: true };

  const batches: ItunesResult[][] = [];
  let throttled = false;

  for (const url of itunesSongSearchUrls(trimmed, SONG_SEARCH_LIMIT)) {
    const outcome = await fetchItunesOutcome(url);
    if (outcome.throttled) throttled = true;
    batches.push(outcome.results);
  }

  return { tracks: mergeSongResults(batches), throttled };
}

export async function resolveSongSnapshot(
  trackId: string
): Promise<CommentTrackData | null> {
  if (!/^\d{1,20}$/.test(trackId)) return null;

  const urls = [
    ...itunesSongLookupFallbackUrls(trackId, 1),
    ...itunesLookupUrls(trackId, { entity: "song", limit: 1 }).filter((url) =>
      url.includes("country=KR")
    ),
  ];

  for (const url of urls) {
    const results = await fetchItunesResults(url);
    const track = results
      .map((item) => mapItunesSong(item))
      .find((item): item is CommentTrackData => Boolean(item));
    if (track) return track;
  }

  return null;
}
