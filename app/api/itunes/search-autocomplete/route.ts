/** GET iTunes 검색 자동완성 */

import { searchArtistsForApi } from "@/src/lib/itunes";
import { apiError, apiOk } from "@/src/lib/http/response";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const term = searchParams.get("term")?.trim() ?? "";

    if (term.length === 0) {
      return apiOk({ results: [] });
    }

    const results = await searchArtistsForApi(term, { limit: 5 });

    return apiOk({ results });
  } catch {
    return apiError("자동완성 검색 실패", { status: 500 });
  }
}
