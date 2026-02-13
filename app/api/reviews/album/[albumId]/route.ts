import { NextResponse } from "next/server";
import { initializeDatabase } from "@/src/lib/db";
import { Review } from "@/src/lib/db/entities/Review";
import { Album } from "@/src/lib/db/entities/Album";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ albumId: string }> }
) {
  try {
    const { albumId } = await params;

    if (!albumId) {
      return NextResponse.json(
        { ok: false, error: "앨범 ID가 필요합니다." },
        { status: 400 }
      );
    }

    const dataSource = await initializeDatabase();
    const reviewRepository = dataSource.getRepository(Review);
    const albumRepository = dataSource.getRepository(Album);

    const album = await albumRepository.findOne({
      where: { albumId },
    });

    if (!album) {
      return NextResponse.json(
        { ok: false, error: "앨범을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 승인된 리뷰만 조회
    const reviews = await reviewRepository.find({
      where: { albumId, isApproved: "Y" },
      relations: ["user"],
      order: { createdAt: "DESC" },
    });

    return NextResponse.json({
      ok: true,
      album: {
        albumId: album.albumId,
        title: album.title,
        artist: album.artist,
        imageUrl: album.imageUrl,
      },
      reviews: reviews.map((review) => ({
        id: review.id,
        content: review.content,
        rating: review.rating,
        isApproved: review.isApproved,
        userId: review.userId,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        user: {
          id: review.user.id,
          nickname: review.user.nickname,
          profileImage: review.user.profileImage,
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
