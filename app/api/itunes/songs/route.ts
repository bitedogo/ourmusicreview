/** GET iTunes 곡 검색 (댓글 추천) */

import { handleApi } from "@/src/lib/http/handle-route-error";
import { apiOk } from "@/src/lib/http/response";
import { enforceItunesProxyRateLimit } from "@/src/lib/itunes/api-rate-limit";
import { ARTIST_SEARCH_MIN_CHARS } from "@/src/lib/itunes/search-config";
import { searchSongsForComment } from "@/src/lib/itunes/song-snapshot";

export async function GET(request: Request) {
  return handleApi("곡 검색 실패", async () => {
    await enforceItunesProxyRateLimit(request);

    const term = new URL(request.url).searchParams.get("term")?.trim() ?? "";
    if (term.length < ARTIST_SEARCH_MIN_CHARS || term.length > 80) {
      return apiOk({ tracks: [], throttled: false });
    }

    return apiOk(await searchSongsForComment(term));
  });
}
