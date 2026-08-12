/** GET 앨범 평점 일괄 조회 */

import { getAlbumRatingsBatch } from "@/src/lib/albums/album-rating-service";
import { initializeDatabase } from "@/src/lib/db";
import { handleRouteError } from "@/src/lib/http/handle-route-error";
import { apiOk } from "@/src/lib/http/response";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dataSource = await initializeDatabase();
    const result = await getAlbumRatingsBatch(
      dataSource,
      searchParams.get("ids")
    );
    return apiOk(result);
  } catch (error) {
    return handleRouteError(
      error,
      "앨범 평점 일괄 조회 중 오류가 발생했습니다."
    );
  }
}
