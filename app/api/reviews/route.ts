/** POST/GET 리뷰 작성·목록 */

import { requireSessionApi, requireWritableSessionApi } from "@/src/lib/auth/session";
import { withDatabase } from "@/src/lib/db";
import { handleApi } from "@/src/lib/http/handle-route-error";
import { apiOk } from "@/src/lib/http/response";
import {
  createReview,
  getUserReviews,
  type CreateReviewInput,
} from "@/src/lib/reviews/review-service";

export async function POST(request: Request) {
  return handleApi("리뷰 작성 중 오류가 발생했습니다.", async () => {
    const { session, response } = await requireWritableSessionApi();
    if (response) return response;

    const body = (await request.json()) as CreateReviewInput;
    const result = await withDatabase((dataSource) =>
      createReview(dataSource, session.user.id, body)
    );

    return apiOk(result, { status: 201 });
  });
}

export async function GET() {
  return handleApi("리뷰 목록 조회 중 오류가 발생했습니다.", async () => {
    const { session, response } = await requireSessionApi();
    if (response) return response;

    const reviews = await withDatabase((dataSource) =>
      getUserReviews(dataSource, session.user.id)
    );

    return apiOk({ reviews });
  });
}
