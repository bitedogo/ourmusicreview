import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth/config";
import { AppDataSource } from "@/src/lib/db/data-source";
import { Comment } from "@/src/lib/db/entities/Comment";
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

    const { content, postId, reviewId } = await request.json();

    if (!content || (!postId && !reviewId)) {
      return NextResponse.json(
        { ok: false, error: "필수 정보가 누락되었습니다." },
        { status: 400 }
      );
    }

    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const commentRepository = AppDataSource.getRepository(Comment);
    
    const newComment = new Comment();
    newComment.id = randomUUID();
    newComment.content = content;
    newComment.userId = session.user.id;
    newComment.postId = postId ? String(postId) : null;
    newComment.reviewId = reviewId ? String(reviewId) : null;

    await commentRepository.save(newComment);

    return NextResponse.json({ ok: true, comment: newComment }, { status: 201 });
  } catch {
    return NextResponse.json(
      { ok: false, error: "댓글 작성 중 오류가 발생했습니다." },
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

    const commentRepository = AppDataSource.getRepository(Comment);
    const comments = await commentRepository.find({
      where: postId ? { postId } : { reviewId: reviewId! },
      relations: ["user"],
      order: { createdAt: "ASC" },
    });

    return NextResponse.json({
      ok: true,
      comments: comments.map((c) => ({
        id: c.id,
        content: c.content,
        createdAt: c.createdAt,
        user: {
          id: c.user.id,
          nickname: c.user.nickname,
          profileImage: c.user.profileImage,
        },
      })),
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "댓글 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
