import { unstable_cache } from "next/cache";
import { getLargeImageUrl } from "@/src/lib/itunes/http";
import type { ChartAlbum } from "./types";

const APPLE_RSS_BASE = "https://rss.marketingtools.apple.com/api/v2";
const DEFAULT_STOREFRONT = "kr";
const DEFAULT_LIMIT = 10;

interface AppleRssAlbum {
  id?: string;
  name?: string;
  artistName?: string;
  artworkUrl100?: string;
  releaseDate?: string;
  genres?: { name?: string }[];
}

interface AppleRssResponse {
  feed?: {
    results?: AppleRssAlbum[];
  };
}

function pickGenre(genres: AppleRssAlbum["genres"]): string {
  const primary = genres?.find((genre) => genre.name && genre.name !== "음악");
  return primary?.name ?? genres?.[0]?.name ?? "";
}

function mapAlbum(album: AppleRssAlbum, index: number): ChartAlbum | null {
  if (!album.id) return null;
  return {
    rank: index + 1,
    collectionId: album.id,
    title: album.name ?? "",
    artist: album.artistName ?? "",
    imageUrl: getLargeImageUrl(album.artworkUrl100),
    genre: pickGenre(album.genres),
    releaseDate: album.releaseDate ?? "",
  };
}

async function fetchAppleChart(
  storefront: string,
  limit: number
): Promise<ChartAlbum[]> {
  const url = `${APPLE_RSS_BASE}/${storefront}/music/most-played/${limit}/albums.json`;

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return [];

    const data = (await response.json()) as AppleRssResponse;
    const results = data.feed?.results ?? [];
    return results
      .map(mapAlbum)
      .filter((album): album is ChartAlbum => album !== null);
  } catch {
    return [];
  }
}

export async function getMusicChart(
  storefront: string = DEFAULT_STOREFRONT,
  limit: number = DEFAULT_LIMIT
): Promise<ChartAlbum[]> {
  return unstable_cache(
    async () => fetchAppleChart(storefront, limit),
    [`music-chart-${storefront}-${limit}`],
    { revalidate: 60 * 60 * 6 }
  )();
}
