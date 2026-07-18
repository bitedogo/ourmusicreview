/** GET 관리자 회원 목록 */

import { requireAdminApi } from "@/src/lib/auth/session";
import { initializeDatabase } from "@/src/lib/db";
import { User } from "@/src/lib/db/entities/User";
import { UserSlideAlbum } from "@/src/lib/db/entities/UserSlideAlbum";
import { Review } from "@/src/lib/db/entities/Review";
import { UserFavoriteAlbum } from "@/src/lib/db/entities/UserFavoriteAlbum";
import { apiError, apiOk } from "@/src/lib/http/response";

export async function GET() {
  try {
    const { response } = await requireAdminApi();
    if (response) return response;

    const dataSource = await initializeDatabase();
    const userRepository = dataSource.getRepository(User);
    const slideRepo = dataSource.getRepository(UserSlideAlbum);
    const reviewRepo = dataSource.getRepository(Review);
    const favoriteRepo = dataSource.getRepository(UserFavoriteAlbum);

    const users = await userRepository.find({
      order: { createdAt: "DESC" },
    });

    const [slideCounts, reviewCounts, favoriteCounts] = await Promise.all([
      slideRepo
        .createQueryBuilder("s")
        .select("s.user_id", "userId")
        .addSelect("COUNT(*)", "count")
        .groupBy("s.user_id")
        .getRawMany<{ userId: string; count: string }>(),
      reviewRepo
        .createQueryBuilder("r")
        .select("r.user_id", "userId")
        .addSelect("COUNT(*)", "count")
        .groupBy("r.user_id")
        .getRawMany<{ userId: string; count: string }>(),
      favoriteRepo
        .createQueryBuilder("f")
        .select("f.user_id", "userId")
        .addSelect("COUNT(*)", "count")
        .groupBy("f.user_id")
        .getRawMany<{ userId: string; count: string }>(),
    ]);

    const byUserId = (rows: { userId: string; count: string }[]) =>
      Object.fromEntries(rows.map((r) => [r.userId, parseInt(r.count, 10) || 0]));

    const slideByUser = byUserId(slideCounts);
    const reviewByUser = byUserId(reviewCounts);
    const favoriteByUser = byUserId(favoriteCounts);

    return apiOk({
      totalMemberCount: users.length,
      members: users.map((user) => ({
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        name: user.name,
        gender: user.gender,
        role: user.role,
        profileImage: user.profileImage,
        createdAt: user.createdAt,
        slideCount: slideByUser[user.id] ?? 0,
        reviewCount: reviewByUser[user.id] ?? 0,
        favoriteCount: favoriteByUser[user.id] ?? 0,
      })),
    });
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "멤버 목록 조회 중 오류가 발생했습니다.",
      { status: 500 }
    );
  }
}
