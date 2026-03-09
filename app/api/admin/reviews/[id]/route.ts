import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth/config";
import { initializeDatabase } from "@/src/lib/db";
import { Review } from "@/src/lib/db/entities/Review";
import { isReviewRejectionReason } from "@/src/lib/review/rejection-reasons";

interface UpdateReviewBody {
  action?: "approve" | "reject";
  rejectReason?: string;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { ok: false, error: "관리자 권한이 필요합니다." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = (await request.json()) as UpdateReviewBody;

    if (!id) {
      return NextResponse.json(
        { ok: false, error: "리뷰 ID가 필요합니다." },
        { status: 400 }
      );
    }

    if (body.action !== "approve" && body.action !== "reject") {
      return NextResponse.json(
        { ok: false, error: "action은 'approve' 또는 'reject'여야 합니다." },
        { status: 400 }
      );
    }

    const dataSource = await initializeDatabase();
    const reviewRepository = dataSource.getRepository(Review);

    const review = await reviewRepository.findOne({
      where: { id },
    });

    if (!review) {
      return NextResponse.json(
        { ok: false, error: "리뷰를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (body.action === "approve") {
      review.isApproved = "Y";
      review.rejectReason = null;
    } else {
      if (!isReviewRejectionReason(body.rejectReason)) {
        return NextResponse.json(
          { ok: false, error: "유효한 반려 사유를 선택해주세요." },
          { status: 400 }
        );
      }
      review.isApproved = "N";
      review.rejectReason = body.rejectReason;
    }

    await reviewRepository.save(review);

    return NextResponse.json({
      ok: true,
      message: body.action === "approve" ? "리뷰가 승인되었습니다." : "리뷰가 반려되었습니다.",
      review: {
        id: review.id,
        isApproved: review.isApproved,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "리뷰 처리 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
