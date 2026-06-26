import { unstable_cache } from "next/cache";
import type { AlbumStreamingLinks } from "./types";

const ITUNES_LOOKUP_URLS = (collectionId: number) => [
  `https://itunes.apple.com/lookup?id=${collectionId}&entity=album&limit=1&country=KR&lang=ko_kr`,
  `https://itunes.apple.com/lookup?id=${collectionId}&entity=album&limit=1`,
];

const ODESLI_API = "https://api.song.link/v1-alpha.1/links";

const FETCH_JSON = {
  headers: { Accept: "application/json" as const },
};

function buildAppleMusicFallbackUrl(collectionId: number): string {
  return `https://music.apple.com/kr/album/id/${collectionId}`;
}

function pickUrl(value: unknown): string | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;
  return value;
}

async function lookupAppleMusicUrl(collectionId: number): Promise<string> {
  for (const url of ITUNES_LOOKUP_URLS(collectionId)) {
    try {
      const response = await fetch(url, FETCH_JSON);
      if (!response.ok) continue;

      const data = (await response.json()) as {
        results?: Array<Record<string, unknown>>;
      };
      const first = data.results?.[0];
      const collectionViewUrl = pickUrl(first?.collectionViewUrl);
      if (collectionViewUrl) {
        return collectionViewUrl;
      }
    } catch {
      continue;
    }
  }

  return buildAppleMusicFallbackUrl(collectionId);
}

interface OdesliPlatformLink {
  url?: string;
}

interface OdesliResponse {
  linksByPlatform?: Record<string, OdesliPlatformLink>;
}

async function fetchOdesliLinks(sourceUrl: string): Promise<AlbumStreamingLinks> {
  try {
    const response = await fetch(
      `${ODESLI_API}?url=${encodeURIComponent(sourceUrl)}&userCountry=KR`,
      FETCH_JSON
    );
    if (!response.ok) {
      return {};
    }

    const data = (await response.json()) as OdesliResponse;
    const platforms = data.linksByPlatform ?? {};

    return {
      appleMusic: pickUrl(platforms.appleMusic?.url ?? platforms.itunes?.url),
      spotify: pickUrl(platforms.spotify?.url),
      youtubeMusic: pickUrl(platforms.youtubeMusic?.url),
    };
  } catch {
    return {};
  }
}

function mergeStreamingLinks(
  appleMusicUrl: string,
  odesliLinks: AlbumStreamingLinks
): AlbumStreamingLinks {
  const links: AlbumStreamingLinks = {
    appleMusic: odesliLinks.appleMusic ?? appleMusicUrl,
  };

  if (odesliLinks.spotify) {
    links.spotify = odesliLinks.spotify;
  }
  if (odesliLinks.youtubeMusic) {
    links.youtubeMusic = odesliLinks.youtubeMusic;
  }

  return links;
}

async function fetchAlbumStreamingLinks(collectionId: string): Promise<AlbumStreamingLinks> {
  const numericId = Number(collectionId);
  if (!Number.isFinite(numericId) || numericId <= 0) {
    return {};
  }

  const appleMusicUrl = await lookupAppleMusicUrl(numericId);
  const odesliLinks = await fetchOdesliLinks(appleMusicUrl);
  return mergeStreamingLinks(appleMusicUrl, odesliLinks);
}

function getCachedAlbumStreamingLinks(collectionId: string) {
  return unstable_cache(
    async () => fetchAlbumStreamingLinks(collectionId),
    [`album-streaming-links-v1-${collectionId}`],
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
