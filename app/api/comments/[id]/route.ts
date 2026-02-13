import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth/config";
import { AppDataSource } from "@/src/lib/db/data-source";
import { Comment } from "@/src/lib/db/entities/Comment";

// 댓글 삭제
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { ok: false, error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const { id } = await params;
    const commentRepository = AppDataSource.getRepository(Comment);
    const comment = await commentRepository.findOne({
      where: { id },
    });

    if (!comment) {
      return NextResponse.json(
        { ok: false, error: "댓글을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 작성자 본인 또는 관리자만 삭제 가능
    if (comment.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { ok: false, error: "삭제 권한이 없습니다." },
        { status: 403 }
      );
    }

    await commentRepository.remove(comment);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "댓글 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
