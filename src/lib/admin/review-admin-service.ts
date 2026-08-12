/** 관리자 리뷰 승인 대기·처리 */

import type { DataSource } from "typeorm";
import { IsNull } from "typeorm";
import { Review } from "@/src/lib/db/entities/Review";
import { isReviewRejectionReason } from "@/src/lib/reviews/rejection-reasons";
import { ServiceError } from "@/src/lib/http/service-error";

export async function listPendingReviews(dataSource: DataSource) {
  const reviews = await dataSource.getRepository(Review).find({
    where: { isApproved: "N", rejectReason: IsNull() },
    relations: ["user", "album"],
    order: { createdAt: "ASC" },
  });

  return reviews.map((review) => ({
    id: review.id,
    content: review.content,
    rating: review.rating,
    isApproved: review.isApproved,
    rejectReason: review.rejectReason,
    userId: review.userId,
    albumId: review.albumId,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
    user: {
      id: review.user.id,
      nickname: review.user.nickname,
      profileImage: review.user.profileImage,
    },
    album: {
      albumId: review.album.albumId,
      title: review.album.title,
      artist: review.album.artist,
      imageUrl: review.album.imageUrl,
    },
  }));
}

export async function moderateReview(
  dataSource: DataSource,
  reviewId: string,
  body: { action?: "approve" | "reject"; rejectReason?: string }
) {
  if (!reviewId) {
    throw new ServiceError("리뷰 ID가 필요합니다.", 400);
  }
  if (body.action !== "approve" && body.action !== "reject") {
    throw new ServiceError("action은 'approve' 또는 'reject'여야 합니다.", 400);
  }

  const reviewRepository = dataSource.getRepository(Review);
  const review = await reviewRepository.findOne({ where: { id: reviewId } });
  if (!review) {
    throw new ServiceError("리뷰를 찾을 수 없습니다.", 404);
  }

  if (body.action === "approve") {
    review.isApproved = "Y";
    review.rejectReason = null;
  } else {
    if (!isReviewRejectionReason(body.rejectReason)) {
      throw new ServiceError("유효한 반려 사유를 선택해주세요.", 400);
    }
    review.isApproved = "N";
    review.rejectReason = body.rejectReason;
  }

  await reviewRepository.save(review);

  return {
    review: {
      id: review.id,
      isApproved: review.isApproved,
    },
    message:
      body.action === "approve"
        ? "리뷰가 승인되었습니다."
        : "리뷰가 반려되었습니다.",
  };
}
