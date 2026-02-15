import { NextResponse } from "next/server";
import { initializeDatabase } from "@/src/lib/db";
import { Review } from "@/src/lib/db/entities/Review";

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

    const reviews = await reviewRepository.find({
      where: { albumId, isApproved: "Y" },
      select: ["rating"],
    });

    if (reviews.length === 0) {
      return NextResponse.json({
        ok: true,
        averageRating: null,
        reviewCount: 0,
      });
    }

    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    const averageRating = Math.round((sum / reviews.length) * 10) / 10;

    return NextResponse.json({
      ok: true,
      averageRating,
      reviewCount: reviews.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "평균 평점 조회 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
