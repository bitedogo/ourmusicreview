import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth/config";
import { initializeDatabase } from "@/src/lib/db";
import { User } from "@/src/lib/db/entities/User";
import { Review } from "@/src/lib/db/entities/Review";

interface Params {
  userId: string;
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<Params> },
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { userId } = await context.params;

  if (!userId) {
    return NextResponse.json({ message: "User ID is required" }, { status: 400 });
  }

  try {
    const limitParam = Number(req.nextUrl.searchParams.get("limit") ?? "5");
    const offsetParam = Number(req.nextUrl.searchParams.get("offset") ?? "0");
    const MAX_LIMIT = 500;
    const limit = Number.isFinite(limitParam)
      ? Math.min(Math.max(Math.floor(limitParam), 1), MAX_LIMIT)
      : 5;
    const offset = Number.isFinite(offsetParam) ? Math.max(Math.floor(offsetParam), 0) : 0;

    const dataSource = await initializeDatabase();
    const userRepository = dataSource.getRepository(User);
    const reviewRepository = dataSource.getRepository(Review);

    const userProfile = await userRepository.findOne({
      where: { id: userId },
      select: [
        "id",
        "nickname",
        "name",
        "email",
        "profileImage",
        "role",
        "gender",
        "createdAt",
      ],
    });

    if (!userProfile) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const stats = await reviewRepository
      .createQueryBuilder("review")
      .select("COUNT(review.id)", "cnt")
      .addSelect("COALESCE(AVG(review.rating), 0)", "avgRating")
      .where("review.user_id = :userId", { userId })
      .getRawOne<{ cnt: string; avgRating: string }>();

    const totalReviewCount = Number(stats?.cnt ?? 0);
    const averageRating =
      totalReviewCount > 0 ? parseFloat(Number(stats?.avgRating ?? 0).toFixed(1)) : 0;

    // 작성 리뷰는 페이지네이션으로 반환 (기본 5개)
    const userReviews = await reviewRepository.find({
      where: { userId: userId },
      order: { createdAt: "DESC" },
      skip: offset,
      take: limit,
      relations: ["album"], // 앨범 정보도 함께 가져옴
    });

    return NextResponse.json({
      ok: true,
      data: {
        profile: {
          id: userProfile.id,
          nickname: userProfile.nickname,
          name: userProfile.name,
          profileImage: userProfile.profileImage,
          gender: userProfile.gender,
          createdAt: userProfile.createdAt,
          averageRating,
        },
        totalReviewCount,
        reviews: userReviews,
        // 나만의 명반은 아직 구현되지 않았으므로 빈 배열로 둠
        masterpieces: [], 
      },
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
