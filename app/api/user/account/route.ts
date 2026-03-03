import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth/config";
import { initializeDatabase } from "@/src/lib/db";
import { User } from "@/src/lib/db/entities/User";
import { UserFavoriteAlbum } from "@/src/lib/db/entities/UserFavoriteAlbum";
import { Like } from "@/src/lib/db/entities/Like";
import { Report } from "@/src/lib/db/entities/Report";
import { Comment } from "@/src/lib/db/entities/Comment";
import { Review } from "@/src/lib/db/entities/Review";

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { ok: false, error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const dataSource = await initializeDatabase();

    const favoriteRepo = dataSource.getRepository(UserFavoriteAlbum);
    await favoriteRepo.delete({ userId });

    const likeRepo = dataSource.getRepository(Like);
    await likeRepo.delete({ userId });

    const reportRepo = dataSource.getRepository(Report);
    await reportRepo.delete({ userId });

    const commentRepo = dataSource.getRepository(Comment);
    await commentRepo.delete({ userId });

    const reviewRepo = dataSource.getRepository(Review);
    await reviewRepo.delete({ userId });

    const userRepo = dataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: userId } });

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    await userRepo.remove(user);

    return NextResponse.json({
      ok: true,
      message: "계정이 삭제되었습니다.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "계정 삭제 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
