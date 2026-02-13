import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth/config";
import { AppDataSource } from "@/src/lib/db/data-source";
import { Report } from "@/src/lib/db/entities/Report";
import { Post } from "@/src/lib/db/entities/Post";
import { Review } from "@/src/lib/db/entities/Review";
import { randomUUID } from "crypto";

// 신고 접수
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { ok: false, error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const { reason, postId, reviewId } = await request.json();

    if (!reason || (!postId && !reviewId)) {
      return NextResponse.json(
        { ok: false, error: "필수 정보가 누락되었습니다." },
        { status: 400 }
      );
    }

    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const dataSource = AppDataSource;

    // 본인 글 신고 방지
    if (postId) {
      const postRepository = dataSource.getRepository(Post);
      const post = await postRepository.findOne({ where: { id: postId } });
      if (post && post.userId === session.user.id) {
        return NextResponse.json(
          { ok: false, error: "자신의 글은 신고할 수 없습니다." },
          { status: 400 }
        );
      }
    }
    if (reviewId) {
      const reviewRepository = dataSource.getRepository(Review);
      const review = await reviewRepository.findOne({ where: { id: reviewId } });
      if (review && review.userId === session.user.id) {
        return NextResponse.json(
          { ok: false, error: "자신의 글은 신고할 수 없습니다." },
          { status: 400 }
        );
      }
    }

    const reportRepository = dataSource.getRepository(Report);
    
    // 동일 사용자가 동일 게시물/리뷰를 중복 신고하는지 확인 (선택 사항)
    const existingReport = await reportRepository.findOne({
      where: {
        userId: session.user.id,
        postId: postId || null,
        reviewId: reviewId || null,
      },
    });

    if (existingReport) {
      return NextResponse.json(
        { ok: false, error: "이미 신고한 게시물/리뷰입니다." },
        { status: 400 }
      );
    }

    const reasonTruncated = String(reason).slice(0, 500);

    const newReport = reportRepository.create({
      id: randomUUID(),
      reason: reasonTruncated,
      userId: session.user.id,
      postId: postId || null,
      reviewId: reviewId || null,
    });

    await reportRepository.save(newReport);

    return NextResponse.json({ ok: true, message: "신고가 접수되었습니다." });
  } catch {
    return NextResponse.json(
      { ok: false, error: "신고 접수 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
