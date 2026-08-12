/** GET 앨범 평균 평점 */

import { getAlbumRating } from "@/src/lib/albums/album-rating-service";
import { initializeDatabase } from "@/src/lib/db";
import { handleRouteError } from "@/src/lib/http/handle-route-error";
import { apiOk } from "@/src/lib/http/response";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ albumId: string }> }
) {
  try {
    const { albumId } = await params;
    const dataSource = await initializeDatabase();
    const result = await getAlbumRating(dataSource, albumId);
    return apiOk(result);
  } catch (error) {
    return handleRouteError(error, "평균 평점 조회 중 오류가 발생했습니다.");
  }
}
