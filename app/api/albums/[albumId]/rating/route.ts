/** GET 앨범 평균 평점 */

import { initializeDatabase } from "@/src/lib/db";
import { Review } from "@/src/lib/db/entities/Review";
import { apiError, apiOk } from "@/src/lib/http/response";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ albumId: string }> }
) {
  try {
    const { albumId } = await params;

    if (!albumId) {
      return apiError("앨범 ID가 필요합니다.", { status: 400 });
    }

    const dataSource = await initializeDatabase();
    const reviewRepository = dataSource.getRepository(Review);

    const reviews = await reviewRepository.find({
      where: { albumId },
      select: ["rating"],
    });

    if (reviews.length === 0) {
      return apiOk({
        averageRating: null,
        reviewCount: 0,
      });
    }

    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    const averageRating = Math.trunc((sum / reviews.length) * 10) / 10;

    return apiOk({
      averageRating,
      reviewCount: reviews.length,
    });
  } catch {
    return apiError("평균 평점 조회 중 오류가 발생했습니다.", {
      status: 500,
    });
  }
}
