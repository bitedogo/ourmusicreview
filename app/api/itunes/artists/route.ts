/** GET iTunes 아티스트 검색 */

import { searchArtists } from "@/src/lib/itunes";
import { apiError, apiOk } from "@/src/lib/http/response";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const term = searchParams.get("term");

    if (!term || term.trim().length === 0) {
      return apiError("검색어를 입력해주세요.", { status: 400 });
    }

    const artists = await searchArtists(term, 20);

    if (artists.length === 0) {
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
