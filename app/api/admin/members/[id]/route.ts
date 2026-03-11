import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth/config";
import { initializeDatabase } from "@/src/lib/db";
import { User } from "@/src/lib/db/entities/User";
import { UserFavoriteAlbum } from "@/src/lib/db/entities/UserFavoriteAlbum";
import { Like } from "@/src/lib/db/entities/Like";
import { Report } from "@/src/lib/db/entities/Report";
import { Comment } from "@/src/lib/db/entities/Comment";
import { Review } from "@/src/lib/db/entities/Review";
import { apiError, apiOk } from "@/src/lib/http/response";

interface UpdateMemberBody {
  role?: "USER" | "ADMIN";
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return apiError("관리자 권한이 필요합니다.", { status: 403 });
    }

    const { id } = await params;
    const body = (await request.json()) as UpdateMemberBody;

    if (!id) {
      return apiError("멤버 ID가 필요합니다.", { status: 400 });
    }

    if (id === session.user.id) {
      return apiError("자기 자신의 권한은 변경할 수 없습니다.", { status: 400 });
    }

    if (body.role !== "USER" && body.role !== "ADMIN") {
      return apiError("role은 'USER' 또는 'ADMIN'이어야 합니다.", { status: 400 });
    }

    const dataSource = await initializeDatabase();
    const userRepository = dataSource.getRepository(User);

    const user = await userRepository.findOne({
      where: { id },
    });

    if (!user) {
      return apiError("멤버를 찾을 수 없습니다.", { status: 404 });
    }

    user.role = body.role;
    await userRepository.save(user);

    return apiOk(
      {
        member: {
          id: user.id,
          role: user.role,
        },
      },
      { message: "멤버 권한이 변경되었습니다." }
    );
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "멤버 권한 변경 중 오류가 발생했습니다.",
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return apiError("관리자 권한이 필요합니다.", { status: 403 });
    }

    const { id } = await params;

    if (!id) {
      return apiError("멤버 ID가 필요합니다.", { status: 400 });
    }

    if (id === session.user.id) {
      return apiError("자기 자신의 계정은 삭제할 수 없습니다.", { status: 400 });
    }

    const dataSource = await initializeDatabase();
    const userRepo = dataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id } });

    if (!user) {
      return apiError("멤버를 찾을 수 없습니다.", { status: 404 });
    }

    const favoriteRepo = dataSource.getRepository(UserFavoriteAlbum);
    await favoriteRepo.delete({ userId: id });

    const likeRepo = dataSource.getRepository(Like);
    await likeRepo.delete({ userId: id });

    const reportRepo = dataSource.getRepository(Report);
    await reportRepo.delete({ userId: id });

    const commentRepo = dataSource.getRepository(Comment);
    await commentRepo.delete({ userId: id });

    const reviewRepo = dataSource.getRepository(Review);
    await reviewRepo.delete({ userId: id });

    await userRepo.remove(user);

    return apiOk({}, { message: "계정이 삭제되었습니다." });
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "계정 삭제 중 오류가 발생했습니다.",
      { status: 500 }
    );
  }
}
