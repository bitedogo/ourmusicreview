import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth/config";
import { initializeDatabase } from "@/src/lib/db";
import { Report } from "@/src/lib/db/entities/Report";
import { Review } from "@/src/lib/db/entities/Review";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(
  request: Request,
  { params }: RouteParams
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
    const body = await request.json().catch(() => ({}));
    const action = body?.action as string | undefined; // "dismiss" | "delete_post" | "delete_review"

    if (!id) {
      return NextResponse.json(
        { ok: false, error: "신고 ID가 필요합니다." },
        { status: 400 }
      );
    }

    const dataSource = await initializeDatabase();
    const reportRepository = dataSource.getRepository(Report);

    const report = await reportRepository.findOne({
      where: { id },
      relations: ["post", "review"],
    });

    if (!report) {
      return NextResponse.json(
        { ok: false, error: "해당 신고를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (action === "dismiss" || !action) {
      await reportRepository.remove(report);
      return NextResponse.json({
        ok: true,
        message: "신고가 무시 처리되었습니다.",
      });
    }

    if (action === "delete_post" && report.postId) {
      const postRepository = dataSource.getRepository(
        (await import("@/src/lib/db/entities/Post")).Post
      );
      const post = await postRepository.findOne({
        where: { id: report.postId },
      });
      if (post) {
        await postRepository.remove(post);
      }
      await reportRepository.remove(report);
      return NextResponse.json({
        ok: true,
        message: "게시글이 삭제되었습니다.",
      });
    }

    if (action === "delete_review" && report.reviewId) {
      const reviewRepository = dataSource.getRepository(Review);
      const review = await reviewRepository.findOne({
        where: { id: report.reviewId },
      });
      if (review) {
        await reviewRepository.remove(review);
      }
      await reportRepository.remove(report);
      return NextResponse.json({
        ok: true,
        message: "리뷰가 삭제되었습니다.",
      });
    }

    return NextResponse.json(
      { ok: false, error: "잘못된 처리 요청입니다." },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "신고 처리 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
