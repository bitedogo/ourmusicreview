import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth/config";
import { AppDataSource } from "@/src/lib/db/data-source";
import { Like } from "@/src/lib/db/entities/Like";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { ok: false, error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const { postId, reviewId } = await request.json();

    if (!postId && !reviewId) {
      return NextResponse.json(
        { ok: false, error: "postId 또는 reviewId가 필요합니다." },
        { status: 400 }
      );
    }

    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const likeRepository = AppDataSource.getRepository(Like);
    
    const existingLike = await likeRepository.findOne({
      where: {
        userId: session.user.id,
        postId: postId || null,
        reviewId: reviewId || null,
      },
    });

    if (existingLike) {
      await likeRepository.remove(existingLike);
      return NextResponse.json({ ok: true, liked: false });
    } else {
      const newLike = likeRepository.create({
        id: randomUUID(),
        userId: session.user.id,
        postId: postId || null,
        reviewId: reviewId || null,
      });
      await likeRepository.save(newLike);
      return NextResponse.json({ ok: true, liked: true });
    }
  } catch {
    return NextResponse.json(
      { ok: false, error: "좋아요 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");
    const reviewId = searchParams.get("reviewId");

    if (!postId && !reviewId) {
      return NextResponse.json(
        { ok: false, error: "postId 또는 reviewId가 필요합니다." },
        { status: 400 }
      );
    }

    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const session = await getServerSession(authOptions);
    const likeRepository = AppDataSource.getRepository(Like);

    const count = await likeRepository.count({
      where: postId ? { postId } : { reviewId: reviewId! },
    });

    let liked = false;
    if (session?.user?.id) {
      const myLike = await likeRepository.findOne({
        where: {
          userId: session.user.id,
          ...(postId ? { postId } : { reviewId: reviewId! }),
        },
      });
      liked = !!myLike;
    }

    return NextResponse.json({ ok: true, count, liked });
  } catch {
    return NextResponse.json(
      { ok: false, error: "좋아요 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
