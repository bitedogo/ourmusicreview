import { apiError, apiOk } from "@/src/lib/http/response";

interface ItunesArtistResultItem {
  artistId: number;
  artistName: string;
  artworkUrl100?: string;
  primaryGenreName?: string;
}

interface DeezerArtistSearchResponse {
  data: Array<{
    picture_xl?: string;
    picture_big?: string;
    picture_medium?: string;
  }>;
}

async function fetchDeezerArtistImage(
  artistName: string
): Promise<string | undefined> {
  try {
    const url = `https://api.deezer.com/search/artist?q=${encodeURIComponent(
      artistName
    )}&limit=1`;
    const response = await fetch(url, { next: { revalidate: 3600 } });
    if (!response.ok) {
      return undefined;
    }

    const data = (await response.json()) as DeezerArtistSearchResponse;
    const artist = data.data?.[0];
    if (!artist) {
      return undefined;
    }

    return (
      artist.picture_xl || artist.picture_big || artist.picture_medium
    );
  } catch {
    return undefined;
  }
}

function normalizeItunesResults(
  results: ItunesArtistResultItem[]
): ItunesArtistResultItem[] {
  const byId = new Map<number, ItunesArtistResultItem>();
  for (const artist of results) {
    if (!artist.artistId || !artist.artistName) {
      continue;
    }
    if (!byId.has(artist.artistId)) {
      byId.set(artist.artistId, {
        artistId: artist.artistId,
        artistName: artist.artistName,
        artworkUrl100: artist.artworkUrl100,
        primaryGenreName: artist.primaryGenreName,
      });
    }
  }
  return Array.from(byId.values());
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const term = searchParams.get("term")?.trim() ?? "";

    if (term.length === 0) {
      return apiOk({ results: [] });
    }

    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(
      term
    )}&entity=musicArtist&limit=5`;
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 120 },
    });

    if (!response.ok) {
      return apiError("iTunes API 요청 실패", { status: 502 });
    }

    const data = (await response.json()) as {
      resultCount: number;
      results: ItunesArtistResultItem[];
    };
    const results = normalizeItunesResults(data.results ?? []);

    const resultsWithDeezerImages = await Promise.all(
      results.map(async (artist) => {
        const deezerImage = await fetchDeezerArtistImage(artist.artistName);
        return {
          ...artist,
          artworkUrl100: deezerImage ?? artist.artworkUrl100,
        };
      })
    );

    return apiOk({ results: resultsWithDeezerImages });
  } catch {
    return apiError("자동완성 검색 실패", { status: 500 });
  }
}
