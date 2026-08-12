/** GET/PATCH/DELETE 관리자 회원 상세·수정·삭제 */

import { requireAdminApi } from "@/src/lib/auth/session";
import { initializeDatabase } from "@/src/lib/db";
import { User } from "@/src/lib/db/entities/User";
import { UserFavoriteAlbum } from "@/src/lib/db/entities/UserFavoriteAlbum";
import { UserSlideAlbum } from "@/src/lib/db/entities/UserSlideAlbum";
import { Review } from "@/src/lib/db/entities/Review";
import { deleteUserAccount } from "@/src/lib/users/user-deletion";
import { apiError, apiOk } from "@/src/lib/http/response";
import {
  listUserSanctions,
  refreshExpiredSuspension,
  toSanctionPublicFields,
} from "@/src/lib/users/user-sanction-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { response } = await requireAdminApi();
    if (response) return response;

    const { id } = await params;
    if (!id) return apiError("멤버 ID가 필요합니다.", { status: 400 });

    const dataSource = await initializeDatabase();
    const userRepo = dataSource.getRepository(User);
    const slideRepo = dataSource.getRepository(UserSlideAlbum);
    const reviewRepo = dataSource.getRepository(Review);
    const favoriteRepo = dataSource.getRepository(UserFavoriteAlbum);

    const user = await userRepo.findOne({ where: { id } });
    if (!user) return apiError("멤버를 찾을 수 없습니다.", { status: 404 });

    await refreshExpiredSuspension(userRepo, user);

    const [slideCount, reviewCount, favoriteCount, slideAlbums, sanctions] =
      await Promise.all([
      slideRepo.count({ where: { userId: id } }),
      reviewRepo.count({ where: { userId: id } }),
      favoriteRepo.count({ where: { userId: id } }),
      slideRepo.find({
        where: { userId: id },
        order: { position: "ASC" },
      }),
      listUserSanctions(dataSource, id),
    ]);

    return apiOk({
      member: {
        id: user.id,
        nickname: user.nickname,
        name: user.name,
        email: user.email,
        gender: user.gender,
        role: user.role,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
        slideCount,
        reviewCount,
        favoriteCount,
        hasUserSlide: slideCount >= 15,
        slideAlbums: slideAlbums.map((a) => ({
          id: a.id,
          collectionId: a.collectionId,
          title: a.title,
          artist: a.artist,
          imageUrl: a.imageUrl,
        })),
        ...toSanctionPublicFields(user),
        sanctions,
      },
    });
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "멤버 조회 중 오류가 발생했습니다.",
      { status: 500 }
    );
  }
}

interface UpdateMemberBody {
  role?: "USER" | "ADMIN";
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { session, response } = await requireAdminApi();
    if (response) return response;

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
    const { session, response } = await requireAdminApi();
    if (response) return response;

    const { id } = await params;

    if (!id) {
      return apiError("멤버 ID가 필요합니다.", { status: 400 });
    }

    if (id === session.user.id) {
      return apiError("자기 자신의 계정은 삭제할 수 없습니다.", { status: 400 });
    }

    const dataSource = await initializeDatabase();
    const deleted = await deleteUserAccount(dataSource, id, {
      blockEmail: true,
      blockedByAdminId: session.user.id,
      blockReason: "관리자에 의한 계정 삭제",
    });

    if (!deleted) {
      return apiError("멤버를 찾을 수 없습니다.", { status: 404 });
    }

    return apiOk({}, { message: "계정이 삭제되었습니다." });
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "계정 삭제 중 오류가 발생했습니다.",
      { status: 500 }
    );
  }
}
