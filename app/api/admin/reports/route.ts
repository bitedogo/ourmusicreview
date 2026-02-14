import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth/config";
import { initializeDatabase } from "@/src/lib/db";
import { Report } from "@/src/lib/db/entities/Report";

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
    const reportRepository = dataSource.getRepository(Report);

    const reports = await reportRepository.find({
      relations: ["user", "post", "review", "review.album", "review.user"],
      order: { createdAt: "DESC" },
    });

    return NextResponse.json({
      ok: true,
      reports: reports.map((r) => ({
        id: r.id,
        reason: r.reason,
        createdAt: r.createdAt,
        reporter: r.user
          ? {
              id: r.user.id,
              nickname: r.user.nickname,
              profileImage: r.user.profileImage,
            }
          : null,
        post: r.post
          ? {
              id: r.post.id,
              title: r.post.title,
              content: r.post.content?.substring(0, 200),
              category: r.post.category,
              authorNickname: r.post.nickname,
            }
          : null,
        review: r.review
          ? {
              id: r.review.id,
              content: r.review.content?.substring(0, 200),
              rating: r.review.rating,
              authorNickname: r.review.user?.nickname ?? null,
              album: r.review.album
                ? {
                    albumId: r.review.album.albumId,
                    title: r.review.album.title,
                    artist: r.review.album.artist,
                  }
                : null,
            }
          : null,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "신고 목록 조회 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
