/** GET iTunes 아티스트 검색 */

import { isItunesCoolingDown, searchArtistsForApi } from "@/src/lib/itunes";
import { apiError, apiOk } from "@/src/lib/http/response";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const term = searchParams.get("term");

    if (!term || term.trim().length === 0) {
      return apiError("검색어를 입력해주세요.", { status: 400 });
    }

    const artists = await searchArtistsForApi(term, { limit: 20 });

    if (artists.length === 0) {
      if (isItunesCoolingDown()) {
        return apiError("검색이 잠시 제한되었습니다. 잠시 후 다시 시도해주세요.", {
          status: 429,
        });
      }
      return apiError("아티스트 검색 결과가 없습니다.", { status: 404 });
    }

    return apiOk({ artists });
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "아티스트 검색 중 오류가 발생했습니다.",
      { status: 500 }
    );
  }
}
