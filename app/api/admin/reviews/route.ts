import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth/config";
import { initializeDatabase } from "@/src/lib/db";
import { Review } from "@/src/lib/db/entities/Review";

// 승인 대기 중인 리뷰 목록 조회
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { ok: false, error: "관리자 권한이 필요합니다." },
        { status: 403 }
      );
    }

    const dataSource = await initializeDatabase();
    const reviewRepository = dataSource.getRepository(Review);

    // 승인 대기 중인 리뷰 조회
    const reviews = await reviewRepository.find({
      where: { isApproved: "N" },
      relations: ["user", "album"],
      order: { createdAt: "ASC" },
    });

    return NextResponse.json({
      ok: true,
      reviews: reviews.map((review) => ({
        id: review.id,
        content: review.content,
        rating: review.rating,
        isApproved: review.isApproved,
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
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "리뷰 목록 조회 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
