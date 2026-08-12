/** 게시글·리뷰 신고 */

import { randomUUID } from "crypto";
import type { DataSource, FindOptionsWhere } from "typeorm";
import { IsNull } from "typeorm";
import { Post } from "@/src/lib/db/entities/Post";
import { Report } from "@/src/lib/db/entities/Report";
import { Review } from "@/src/lib/db/entities/Review";
import { ServiceError } from "@/src/lib/http/service-error";

export async function createReport(
  dataSource: DataSource,
  userId: string,
  input: { reason?: unknown; postId?: unknown; reviewId?: unknown }
) {
  const reason = input.reason;
  const postId = input.postId ? String(input.postId) : null;
  const reviewId = input.reviewId ? String(input.reviewId) : null;

  if (!reason || (!postId && !reviewId)) {
    throw new ServiceError("필수 정보가 누락되었습니다.", 400);
  }

  if (postId) {
    const post = await dataSource.getRepository(Post).findOne({
      where: { id: postId },
    });
    if (post && post.userId === userId) {
      throw new ServiceError("자신의 글은 신고할 수 없습니다.", 400);
    }
  }
  if (reviewId) {
    const review = await dataSource.getRepository(Review).findOne({
      where: { id: reviewId },
    });
    if (review && review.userId === userId) {
      throw new ServiceError("자신의 글은 신고할 수 없습니다.", 400);
    }
  }

  const reportRepository = dataSource.getRepository(Report);
  const where: FindOptionsWhere<Report> = {
    userId,
    postId: postId ?? IsNull(),
    reviewId: reviewId ?? IsNull(),
  };
  const existingReport = await reportRepository.findOne({ where });
  if (existingReport) {
    throw new ServiceError("이미 신고한 게시물/리뷰입니다.", 400);
  }

  const newReport = reportRepository.create({
    id: randomUUID(),
    reason: String(reason).slice(0, 500),
    userId,
    postId,
    reviewId,
  });
  await reportRepository.save(newReport);
  return { reported: true };
}
