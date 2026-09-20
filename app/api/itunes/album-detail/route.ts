/** GET iTunes 앨범 상세 */

import { handleApi } from "@/src/lib/http/handle-route-error";
import { apiError, apiOk } from "@/src/lib/http/response";
import { enforceItunesProxyRateLimit } from "@/src/lib/itunes/api-rate-limit";
import { getItunesAlbumDetail } from "@/src/lib/itunes/album-detail";

export async function GET(request: Request) {
  return handleApi("앨범 상세 조회 중 오류가 발생했습니다.", async () => {
    await enforceItunesProxyRateLimit(request);

    const { searchParams } = new URL(request.url);
    const collectionId = searchParams.get("collectionId")?.trim() ?? "";

    if (!collectionId) {
      return apiError("앨범 ID가 필요합니다.", { status: 400 });
    }

    const album = await getItunesAlbumDetail(collectionId);
    if (!album) {
      return apiError("iTunes에서 앨범 정보를 찾지 못했습니다.", { status: 404 });
    }

    return apiOk({ album });
  });
}
