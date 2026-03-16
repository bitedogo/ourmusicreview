import { apiError, apiOk } from "@/src/lib/http/response";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const term = searchParams.get("term");

    if (!term || term.trim().length === 0) {
      return apiOk({ results: [] });
    }

    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term.trim())}&entity=musicArtist&limit=5`;
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 120 },
    });

    if (!response.ok) {
      return apiError("iTunes API 요청 실패", { status: 502 });
    }

    const data = (await response.json()) as {
      resultCount: number;
      results: Array<{ artistId: number; artistName: string; artworkUrl100?: string; primaryGenreName?: string }>;
    };
    const results = data.results ?? [];

    return apiOk({ results });
  } catch {
    return apiError("자동완성 검색 실패", {
      status: 500,
    });
  }
}
