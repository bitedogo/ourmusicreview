/** 트랙 단위 스트리밍 재생 링크 수집 (Odesli + Spotify/Deezer 폴백) */

import { unstable_cache } from "next/cache";
import { fetchItunesResults, itunesLookupUrls } from "@/src/lib/itunes/http";
import { searchSpotifyTrackUrl } from "@/src/lib/spotify/track-search";
import { looseMatch, normalizeForMatch } from "@/src/lib/text/match";
import type { AlbumStreamingLinks } from "./types";

const ODESLI_API = "https://api.song.link/v1-alpha.1/links";
const DEEZER_TRACK_SEARCH_API = "https://api.deezer.com/search/track";

const FETCH_JSON = {
  headers: { Accept: "application/json" as const },
};

function pickUrl(value: unknown): string | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;
  return value;
}

interface OdesliResponse {
  linksByPlatform?: Record<string, { url?: string }>;
}

interface DeezerTrack {
  title?: string;
  link?: string;
  artist?: { name?: string };
}

async function lookupItunesTrackViewUrl(trackId: string): Promise<{
  trackViewUrl?: string;
  trackName?: string;
  artistName?: string;
}> {
  if (!/^\d+$/.test(trackId)) return {};

  for (const url of itunesLookupUrls(trackId, { entity: "song", limit: 1 })) {
    const results = await fetchItunesResults(url);
    const track =
      results.find((item) => String(item.wrapperType ?? "") === "track") ?? results[0];
    if (!track) continue;

    return {
      trackViewUrl: pickUrl(track.trackViewUrl),
      trackName: typeof track.trackName === "string" ? track.trackName : undefined,
      artistName: typeof track.artistName === "string" ? track.artistName : undefined,
    };
  }

  return {};
}

async function fetchOdesliTrackLinks(trackId: string): Promise<AlbumStreamingLinks> {
  try {
    const response = await fetch(
      `${ODESLI_API}?platform=itunes&type=song&id=${encodeURIComponent(trackId)}&userCountry=KR`,
      FETCH_JSON
    );
    if (!response.ok) return {};

    const data = (await response.json()) as OdesliResponse;
    const platforms = data.linksByPlatform ?? {};
    return {
      appleMusic: pickUrl(platforms.appleMusic?.url ?? platforms.itunes?.url),
      spotify: pickUrl(platforms.spotify?.url),
      deezer: pickUrl(platforms.deezer?.url),
    };
  } catch {
    return {};
  }
}

async function searchDeezerTrackUrl(
  artist: string,
  title: string
): Promise<string | undefined> {
  const query = `${artist} ${title}`.trim();
  if (!query) return undefined;

  try {
    const response = await fetch(
      `${DEEZER_TRACK_SEARCH_API}?q=${encodeURIComponent(query)}&limit=10`,
      FETCH_JSON
    );
    if (!response.ok) return undefined;

    const data = (await response.json()) as { data?: DeezerTrack[] };
    const targetArtist = normalizeForMatch(artist);
    const matched = (data.data ?? []).find(
      (track) =>
        looseMatch(track.title ?? "", title) &&
        !!targetArtist &&
        looseMatch(track.artist?.name ?? "", artist)
    );

    return pickUrl(matched?.link);
  } catch {
    return undefined;
  }
}

async function fetchTrackStreamingLinks(trackId: string): Promise<AlbumStreamingLinks> {
  const trimmed = trackId.trim();
  if (!/^\d+$/.test(trimmed)) return {};

  const [odesli, itunes] = await Promise.all([
    fetchOdesliTrackLinks(trimmed),
    lookupItunesTrackViewUrl(trimmed),
  ]);

  const links: AlbumStreamingLinks = {};
  if (odesli.appleMusic || itunes.trackViewUrl) {
    links.appleMusic = odesli.appleMusic ?? itunes.trackViewUrl;
  }

  const needSpotify = !odesli.spotify && Boolean(itunes.artistName && itunes.trackName);
  const needDeezer = !odesli.deezer && Boolean(itunes.artistName && itunes.trackName);

  if (needSpotify || needDeezer) {
    const [spotify, deezer] = await Promise.all([
      needSpotify
        ? searchSpotifyTrackUrl(itunes.artistName!, itunes.trackName!)
        : Promise.resolve(undefined),
      needDeezer
        ? searchDeezerTrackUrl(itunes.artistName!, itunes.trackName!)
        : Promise.resolve(undefined),
    ]);
    if (spotify) links.spotify = spotify;
    if (deezer) links.deezer = deezer;
  }

  if (odesli.spotify) links.spotify = odesli.spotify;
  if (odesli.deezer) links.deezer = odesli.deezer;

  return links;
}

function getCachedTrackStreamingLinks(trackId: string) {
  return unstable_cache(
    async () => fetchTrackStreamingLinks(trackId),
    [`track-streaming-links-v2-${trackId}`],
    { revalidate: 60 * 60 * 24 * 30 }
  )();
}

export async function getTrackStreamingLinks(
  trackId: string
): Promise<AlbumStreamingLinks> {
  return getCachedTrackStreamingLinks(trackId);
}

export async function getBatchTrackStreamingLinks(
  trackIds: string[]
): Promise<Record<string, AlbumStreamingLinks>> {
  const uniqueIds = Array.from(new Set(trackIds.map((id) => id.trim()).filter(Boolean)));
  const entries = await Promise.all(
    uniqueIds.map(async (trackId) => {
      const links = await getTrackStreamingLinks(trackId);
      return [trackId, links] as const;
    })
  );
  return Object.fromEntries(entries);
}
