/** GET/PATCH/DELETE 리뷰 상세·수정·삭제 */

import { isAdmin, requireSessionApi } from "@/src/lib/auth/session";
import { initializeDatabase } from "@/src/lib/db";
import { apiError, apiOk } from "@/src/lib/http/response";
import { ServiceError } from "@/src/lib/http/service-error";
import {
  deleteReview,
  getReviewDetail,
  updateReview,
  type UpdateReviewInput,
} from "@/src/lib/reviews/review-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return apiError("리뷰 ID가 필요합니다.", { status: 400 });
    }

    const dataSource = await initializeDatabase();
    const result = await getReviewDetail(dataSource, id);

    return apiOk(result);
  } catch (error) {
    if (error instanceof ServiceError) {
      return apiError(error.message, { status: error.status });
    }
    return apiError(
      error instanceof Error ? error.message : "리뷰 조회 중 오류가 발생했습니다.",
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { session, response } = await requireSessionApi();
    if (response) return response;

    const body = (await request.json()) as UpdateReviewInput;

    const dataSource = await initializeDatabase();
    const result = await updateReview(
      dataSource,
      id,
      { userId: session.user.id, isAdmin: isAdmin(session) },
      body
    );

    return apiOk({ review: result });
  } catch (error) {
    if (error instanceof ServiceError) {
      return apiError(error.message, { status: error.status });
    }
    return apiError(
      error instanceof Error ? error.message : "리뷰 수정 중 오류가 발생했습니다.",
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { session, response } = await requireSessionApi();
    if (response) return response;

    const dataSource = await initializeDatabase();
    await deleteReview(dataSource, id, {
      userId: session.user.id,
      isAdmin: isAdmin(session),
    });

    return apiOk({});
  } catch (error) {
    if (error instanceof ServiceError) {
      return apiError(error.message, { status: error.status });
    }
    return apiError(
      error instanceof Error ? error.message : "리뷰 삭제 중 오류가 발생했습니다.",
      { status: 500 }
    );
  }
}
