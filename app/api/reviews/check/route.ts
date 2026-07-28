/** GET 앨범 리뷰 작성 여부 확인 */

import { requireSessionApi } from "@/src/lib/auth/session";
import { initializeDatabase } from "@/src/lib/db";
import { Review } from "@/src/lib/db/entities/Review";
import { apiError, apiOk } from "@/src/lib/http/response";

export async function GET(request: Request) {
  try {
    const { session, response } = await requireSessionApi();
    if (response) return response;

    const { searchParams } = new URL(request.url);
    const albumId = searchParams.get("albumId")?.trim();
    if (!albumId) {
      return apiError("앨범 ID가 필요합니다.", { status: 400 });
    }

    const dataSource = await initializeDatabase();
    const reviewRepository = dataSource.getRepository(Review);
    const existing = await reviewRepository.findOne({
      where: {
        userId: session.user.id,
        albumId,
      },
      select: ["id"],
    });

    return apiOk({
      exists: Boolean(existing),
      reviewId: existing?.id ?? null,
    });
  } catch {
    return apiError("리뷰 중복 확인 중 오류가 발생했습니다.", { status: 500 });
  }
}
