import { IsNull } from "typeorm";
import { requireAdminApi } from "@/src/lib/auth/session";
import { initializeDatabase } from "@/src/lib/db";
import { Review } from "@/src/lib/db/entities/Review";
import { apiError, apiOk } from "@/src/lib/http/response";

export async function GET() {
  try {
    const { response } = await requireAdminApi();
    if (response) return response;

    const dataSource = await initializeDatabase();
    const reviewRepository = dataSource.getRepository(Review);

    const reviews = await reviewRepository.find({
      where: { isApproved: "N", rejectReason: IsNull() },
      relations: ["user", "album"],
      order: { createdAt: "ASC" },
    });

    return apiOk({
      reviews: reviews.map((review) => ({
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
      })),
    });
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "리뷰 목록 조회 중 오류가 발생했습니다.",
      { status: 500 }
    );
  }
}
