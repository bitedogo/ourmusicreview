/** POST/GET 리뷰 작성·목록 */

import { requireSessionApi, requireWritableSessionApi } from "@/src/lib/auth/session";
import { initializeDatabase } from "@/src/lib/db";
import { handleRouteError } from "@/src/lib/http/handle-route-error";
import { apiOk } from "@/src/lib/http/response";
import {
  createReview,
  getUserReviews,
  type CreateReviewInput,
} from "@/src/lib/reviews/review-service";

export async function POST(request: Request) {
  try {
    const { session, response } = await requireWritableSessionApi();
    if (response) return response;

    const body = (await request.json()) as CreateReviewInput;

    const dataSource = await initializeDatabase();
    const result = await createReview(dataSource, session.user.id, body);

    return apiOk(result, { status: 201 });
  } catch (error) {
    return handleRouteError(error, "리뷰 작성 중 오류가 발생했습니다.");
  }
}

export async function GET() {
  try {
    const { session, response } = await requireSessionApi();
    if (response) return response;

    const dataSource = await initializeDatabase();
    const reviews = await getUserReviews(dataSource, session.user.id);

    return apiOk({ reviews });
  } catch (error) {
    return handleRouteError(error, "리뷰 목록 조회 중 오류가 발생했습니다.");
  }
}
