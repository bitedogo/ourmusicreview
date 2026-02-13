import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth/config";
import { initializeDatabase } from "@/src/lib/db";
import { Review } from "@/src/lib/db/entities/Review";
import { Album } from "@/src/lib/db/entities/Album";
import { randomUUID } from "crypto";

interface CreateReviewBody {
  albumId?: string;
  content?: string;
  rating?: number;
  // 앨범 자동 등록을 위한 정보 (앨범이 없을 경우)
  albumTitle?: string;
  albumArtist?: string;
  albumImageUrl?: string | null;
  albumReleaseDate?: string;
}

// 리뷰 생성
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { ok: false, error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const body = (await request.json()) as CreateReviewBody;
    const albumId =
      typeof body.albumId === "string" ? body.albumId.trim() : undefined;
    const content =
      typeof body.content === "string" ? body.content.trim() : undefined;
    // 평점 검증: 0-10 사이의 숫자이며 소수점 한 자리까지 허용
    let rating: number | undefined = undefined;
    if (typeof body.rating === "number" && !isNaN(body.rating)) {
      // 소수점 한 자리로 반올림
      const rounded = Math.round(body.rating * 10) / 10;
      if (rounded >= 0 && rounded <= 10) {
        rating = rounded;
      }
    }

    if (!albumId || !content) {
      return NextResponse.json(
        { ok: false, error: "앨범 ID와 리뷰 내용은 필수입니다." },
        { status: 400 }
      );
    }

    if (rating === undefined) {
      return NextResponse.json(
        { ok: false, error: "평점(0.0-10.0)을 입력해주세요." },
        { status: 400 }
      );
    }

    const dataSource = await initializeDatabase();
    const albumRepository = dataSource.getRepository(Album);
    const reviewRepository = dataSource.getRepository(Review);

    // 앨범 존재 확인
    let album = await albumRepository.findOne({
      where: { albumId },
    });

    // 앨범이 없으면 자동으로 등록
    if (!album) {
      const albumTitle =
        typeof body.albumTitle === "string" ? body.albumTitle.trim() : undefined;
      const albumArtist =
        typeof body.albumArtist === "string" ? body.albumArtist.trim() : undefined;
      const albumImageUrl =
        typeof body.albumImageUrl === "string" && body.albumImageUrl.length > 0
          ? body.albumImageUrl
          : null;

      if (!albumTitle || !albumArtist) {
        return NextResponse.json(
          { ok: false, error: "앨범 정보가 부족합니다. 앨범 제목과 아티스트는 필수입니다." },
          { status: 400 }
        );
      }

      // 날짜 파싱
      let releaseDate: Date | undefined = undefined;
      if (body.albumReleaseDate) {
        const parsed = new Date(body.albumReleaseDate);
        if (!isNaN(parsed.getTime())) {
          releaseDate = parsed;
        }
      }

      const newAlbum = albumRepository.create({
        albumId,
        title: albumTitle,
        artist: albumArtist,
        imageUrl: albumImageUrl || undefined,
        releaseDate,
        category: "I", // 기본값으로 "I" 설정
      });

      await albumRepository.save(newAlbum);
      album = newAlbum;
    }

    // 리뷰 ID 생성 (VARCHAR(255)에 맞게)
    const reviewId = randomUUID().replace(/-/g, "").slice(0, 255);

    const review = reviewRepository.create({
      id: reviewId,
      albumId,
      userId: session.user.id,
      content,
      rating,
      isApproved: "N", // 기본값: 미승인
    });

    await reviewRepository.save(review);

    return NextResponse.json({ ok: true, id: review.id }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "리뷰 작성 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

// 현재 로그인한 사용자가 작성한 리뷰 목록 조회
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { ok: false, error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const dataSource = await initializeDatabase();
    const reviewRepository = dataSource.getRepository(Review);

    const reviews = await reviewRepository.find({
      where: { userId: session.user.id },
      relations: ["album"],
      order: { createdAt: "DESC" },
    });

    return NextResponse.json(
      {
        ok: true,
        reviews: reviews.map((review) => ({
          id: review.id,
          content: review.content,
          rating: review.rating,
          isApproved: review.isApproved,
          albumId: review.albumId,
          createdAt: review.createdAt,
          updatedAt: review.updatedAt,
          album: review.album
            ? {
                albumId: review.album.albumId,
                title: review.album.title,
                artist: review.album.artist,
                imageUrl: review.album.imageUrl,
              }
            : null,
        })),
      },
      { status: 200 }
    );
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
