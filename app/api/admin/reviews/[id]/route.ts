import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth/config";
import { initializeDatabase } from "@/src/lib/db";
import { Review } from "@/src/lib/db/entities/Review";

interface UpdateReviewBody {
  action?: "approve" | "reject";
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
    } else {
      await reviewRepository.remove(review);
      return NextResponse.json({
        ok: true,
        message: "리뷰가 거부되어 삭제되었습니다.",
      });
    }

    await reviewRepository.save(review);

    return NextResponse.json({
      ok: true,
      message: body.action === "approve" ? "리뷰가 승인되었습니다." : "리뷰가 거부되었습니다.",
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
