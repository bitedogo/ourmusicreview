import { requireAdminApi } from "@/src/lib/auth/session";
import { initializeDatabase } from "@/src/lib/db";
import { Report } from "@/src/lib/db/entities/Report";
import { Review } from "@/src/lib/db/entities/Review";
import { apiError, apiOk } from "@/src/lib/http/response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(
  request: Request,
  { params }: RouteParams
) {
  try {
    const { response } = await requireAdminApi();
    if (response) return response;

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const action = body?.action as string | undefined;

    if (!id) {
      return apiError("신고 ID가 필요합니다.", { status: 400 });
    }

    const dataSource = await initializeDatabase();
    const reportRepository = dataSource.getRepository(Report);

    const report = await reportRepository.findOne({
      where: { id },
      relations: ["post", "review"],
    });

    if (!report) {
      return apiError("해당 신고를 찾을 수 없습니다.", { status: 404 });
    }

    if (action === "dismiss" || !action) {
      await reportRepository.remove(report);
      return apiOk({ id: report.id, action: "dismiss" }, { message: "신고가 무시 처리되었습니다." });
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
      return apiOk({ id: report.id, action: "delete_post" }, { message: "게시글이 삭제되었습니다." });
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
      return apiOk({ id: report.id, action: "delete_review" }, { message: "리뷰가 삭제되었습니다." });
    }

    return apiError("잘못된 처리 요청입니다.", { status: 400 });
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "신고 처리 중 오류가 발생했습니다.",
      { status: 500 }
    );
  }
}
