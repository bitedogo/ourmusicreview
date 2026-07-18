/** PATCH 관리자 리뷰 승인·반려 */

import { requireAdminApi } from "@/src/lib/auth/session";
import { initializeDatabase } from "@/src/lib/db";
import { Review } from "@/src/lib/db/entities/Review";
import { isReviewRejectionReason } from "@/src/lib/review/rejection-reasons";
import { apiError, apiOk } from "@/src/lib/http/response";

interface UpdateReviewBody {
  action?: "approve" | "reject";
  rejectReason?: string;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { response } = await requireAdminApi();
    if (response) return response;

    const { id } = await params;
    const body = (await request.json()) as UpdateReviewBody;

    if (!id) {
      return apiError("리뷰 ID가 필요합니다.", { status: 400 });
    }

    if (body.action !== "approve" && body.action !== "reject") {
      return apiError("action은 'approve' 또는 'reject'여야 합니다.", {
        status: 400,
      });
    }

    const dataSource = await initializeDatabase();
    const reviewRepository = dataSource.getRepository(Review);

    const review = await reviewRepository.findOne({
      where: { id },
    });

    if (!review) {
      return apiError("리뷰를 찾을 수 없습니다.", { status: 404 });
    }

    if (body.action === "approve") {
      review.isApproved = "Y";
      review.rejectReason = null;
    } else {
      if (!isReviewRejectionReason(body.rejectReason)) {
        return apiError("유효한 반려 사유를 선택해주세요.", { status: 400 });
      }
      review.isApproved = "N";
      review.rejectReason = body.rejectReason;
    }

    await reviewRepository.save(review);

    return apiOk(
      {
        review: {
          id: review.id,
          isApproved: review.isApproved,
        },
      },
      {
        message:
          body.action === "approve"
            ? "리뷰가 승인되었습니다."
            : "리뷰가 반려되었습니다.",
      }
    );
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "리뷰 처리 중 오류가 발생했습니다.",
      { status: 500 }
    );
  }
}
