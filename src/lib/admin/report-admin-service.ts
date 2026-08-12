/** 관리자 신고 목록·처리 */

import type { DataSource } from "typeorm";
import { Post } from "@/src/lib/db/entities/Post";
import { Report } from "@/src/lib/db/entities/Report";
import { Review } from "@/src/lib/db/entities/Review";
import { ServiceError } from "@/src/lib/http/service-error";

export async function listAdminReports(dataSource: DataSource) {
  const reports = await dataSource.getRepository(Report).find({
    relations: ["user", "post", "review", "review.album", "review.user"],
    order: { createdAt: "DESC" },
  });

  return reports.map((r) => ({
    id: r.id,
    reason: r.reason,
    createdAt: r.createdAt,
    reporter: r.user
      ? {
          id: r.user.id,
          nickname: r.user.nickname,
          profileImage: r.user.profileImage,
        }
      : null,
    post: r.post
      ? {
          id: r.post.id,
          title: r.post.title,
          content: r.post.content?.substring(0, 200),
          category: r.post.category,
          authorNickname: r.post.nickname,
        }
      : null,
    review: r.review
      ? {
          id: r.review.id,
          content: r.review.content?.substring(0, 200),
          rating: r.review.rating,
          authorNickname: r.review.user?.nickname ?? null,
          album: r.review.album
            ? {
                albumId: r.review.album.albumId,
                title: r.review.album.title,
                artist: r.review.album.artist,
              }
            : null,
        }
      : null,
  }));
}

export async function resolveAdminReport(
  dataSource: DataSource,
  reportId: string,
  action: string | undefined
) {
  if (!reportId) {
    throw new ServiceError("신고 ID가 필요합니다.", 400);
  }

  const reportRepository = dataSource.getRepository(Report);
  const report = await reportRepository.findOne({
    where: { id: reportId },
    relations: ["post", "review"],
  });
  if (!report) {
    throw new ServiceError("해당 신고를 찾을 수 없습니다.", 404);
  }

  if (action === "dismiss" || !action) {
    await reportRepository.remove(report);
    return {
      result: { id: report.id, action: "dismiss" as const },
      message: "신고가 무시 처리되었습니다.",
    };
  }

  if (action === "delete_post" && report.postId) {
    const postRepository = dataSource.getRepository(Post);
    const post = await postRepository.findOne({
      where: { id: report.postId },
    });
    if (post) {
      await postRepository.remove(post);
    }
    await reportRepository.remove(report);
    return {
      result: { id: report.id, action: "delete_post" as const },
      message: "게시글이 삭제되었습니다.",
    };
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
    return {
      result: { id: report.id, action: "delete_review" as const },
      message: "리뷰가 삭제되었습니다.",
    };
  }

  throw new ServiceError("잘못된 처리 요청입니다.", 400);
}
