/** GET iTunes 검색 자동완성 */

import { handleApi } from "@/src/lib/http/handle-route-error";
import { apiError, apiOk } from "@/src/lib/http/response";
import { enforceItunesProxyRateLimit } from "@/src/lib/itunes/api-rate-limit";
import { isItunesCoolingDown, searchArtistsForApi } from "@/src/lib/itunes";
import { ARTIST_SEARCH_MIN_CHARS } from "@/src/lib/itunes/search-config";

export async function GET(request: Request) {
  return handleApi("자동완성 검색 실패", async () => {
    await enforceItunesProxyRateLimit(request);

    const { searchParams } = new URL(request.url);
    const term = searchParams.get("term")?.trim() ?? "";

    if (term.length < ARTIST_SEARCH_MIN_CHARS) {
      return apiOk({ results: [] });
    }

    const results = await searchArtistsForApi(term, { limit: 5, light: true });

    return apiOk({
      results,
      throttled: results.length === 0 && isItunesCoolingDown(),
    });
  });
}
