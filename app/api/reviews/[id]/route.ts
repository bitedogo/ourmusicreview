import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth/config";
import { initializeDatabase } from "@/src/lib/db";
import { Review } from "@/src/lib/db/entities/Review";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { ok: false, error: "리뷰 ID가 필요합니다." },
        { status: 400 }
      );
    }

    const dataSource = await initializeDatabase();
    const reviewRepository = dataSource.getRepository(Review);

    const review = await reviewRepository.findOne({
      where: { id },
      relations: ["user", "album"],
    });

    if (!review) {
      return NextResponse.json(
        { ok: false, error: "리뷰를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      review: {
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
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "리뷰 조회 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

// 리뷰 삭제
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { ok: false, error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const dataSource = await initializeDatabase();
    const reviewRepository = dataSource.getRepository(Review);

    const review = await reviewRepository.findOne({
      where: { id },
    });

    if (!review) {
      return NextResponse.json(
        { ok: false, error: "리뷰를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 작성자 본인 또는 관리자만 삭제 가능
    if (review.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { ok: false, error: "삭제 권한이 없습니다." },
        { status: 403 }
      );
    }

    await reviewRepository.remove(review);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "리뷰 삭제 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
