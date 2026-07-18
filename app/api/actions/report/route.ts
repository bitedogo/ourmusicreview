/** POST 콘텐츠 신고 */

import { requireSessionApi } from "@/src/lib/auth/session";
import { initializeDatabase } from "@/src/lib/db";
import { Report } from "@/src/lib/db/entities/Report";
import { Post } from "@/src/lib/db/entities/Post";
import { Review } from "@/src/lib/db/entities/Review";
import { randomUUID } from "crypto";
import { apiError, apiOk } from "@/src/lib/http/response";

export async function POST(request: Request) {
  try {
    const { session, response } = await requireSessionApi();
    if (response) return response;

    const { reason, postId, reviewId } = await request.json();

    if (!reason || (!postId && !reviewId)) {
      return apiError("필수 정보가 누락되었습니다.", { status: 400 });
    }

    const dataSource = await initializeDatabase();

    if (postId) {
      const postRepository = dataSource.getRepository(Post);
      const post = await postRepository.findOne({ where: { id: postId } });
      if (post && post.userId === session.user.id) {
        return apiError("자신의 글은 신고할 수 없습니다.", { status: 400 });
      }
    }
    if (reviewId) {
      const reviewRepository = dataSource.getRepository(Review);
      const review = await reviewRepository.findOne({ where: { id: reviewId } });
      if (review && review.userId === session.user.id) {
        return apiError("자신의 글은 신고할 수 없습니다.", { status: 400 });
      }
    }

    const reportRepository = dataSource.getRepository(Report);

    const existingReport = await reportRepository.findOne({
      where: {
        userId: session.user.id,
        postId: postId || null,
        reviewId: reviewId || null,
      },
    });

    if (existingReport) {
      return apiError("이미 신고한 게시물/리뷰입니다.", { status: 400 });
    }

    const reasonTruncated = String(reason).slice(0, 500);

    const newReport = reportRepository.create({
      id: randomUUID(),
      reason: reasonTruncated,
      userId: session.user.id,
      postId: postId || null,
      reviewId: reviewId || null,
    });

    await reportRepository.save(newReport);

    return apiOk({ reported: true }, { message: "신고가 접수되었습니다." });
  } catch {
    return apiError("신고 접수 중 오류가 발생했습니다.", { status: 500 });
  }
}
