/** Spotify 트랙 검색 */

import { createTtlCache } from "@/src/lib/utils/ttl-cache";
import { looseMatch, normalizeForMatch } from "@/src/lib/text/match";
import { spotifyFetch } from "./client";

const resultCache = createTtlCache<string>(24 * 60 * 60 * 1000);

interface SpotifySearchTrack {
  id?: string;
  name?: string;
  artists?: Array<{ name?: string }>;
  external_urls?: { spotify?: string };
}

function buildSpotifyTrackUrl(trackId: string): string {
  return `https://open.spotify.com/track/${trackId}`;
}

export async function searchSpotifyTrackUrl(
  artist: string,
  title: string
): Promise<string | undefined> {
  const trimmedArtist = artist.trim();
  const trimmedTitle = title.trim();
  if (!trimmedArtist || !trimmedTitle) return undefined;

  const cacheKey = `track-v1::${trimmedArtist}::${trimmedTitle}`;
  const cached = resultCache.get(cacheKey);
  if (cached) return cached;

  const query = `track:${trimmedTitle} artist:${trimmedArtist}`;
  const data = await spotifyFetch<{ tracks?: { items?: SpotifySearchTrack[] } }>(
    `/search?type=track&limit=10&q=${encodeURIComponent(query)}`
  );

  const items = data?.tracks?.items ?? [];
  const targetArtist = normalizeForMatch(trimmedArtist);
  const matched =
    items.find(
      (track) =>
        looseMatch(track.name ?? "", trimmedTitle) &&
        (track.artists ?? []).some((item) =>
          looseMatch(item.name ?? "", trimmedArtist)
        )
    ) ??
    items.find((track) => looseMatch(track.name ?? "", trimmedTitle)) ??
    (targetArtist ? items[0] : undefined);

  const trackId = matched?.id?.trim();
  const externalUrl = matched?.external_urls?.spotify?.trim();
  const url = externalUrl || (trackId ? buildSpotifyTrackUrl(trackId) : undefined);
  if (!url) return undefined;

  resultCache.set(cacheKey, url);
  return url;
}
