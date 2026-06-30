import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth/config";
import { initializeDatabase } from "@/src/lib/db";
import { User } from "@/src/lib/db/entities/User";
import { Review } from "@/src/lib/db/entities/Review";
import { UserFavoriteAlbum } from "@/src/lib/db/entities/UserFavoriteAlbum";
import { UserSlideAlbum } from "@/src/lib/db/entities/UserSlideAlbum";

interface Params {
  userId: string;
}

function isPublic(flag: "Y" | "N" | undefined) {
  return flag !== "N";
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
    const favoriteRepository = dataSource.getRepository(UserFavoriteAlbum);
    const slideRepository = dataSource.getRepository(UserSlideAlbum);

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
        "showReviewsPublic",
        "showFavoritesPublic",
        "showMasterpiecesPublic",
        "showRatingPublic",
      ],
    });

    if (!userProfile) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const isOwner = session.user?.id === userId;
    const showReviews = isPublic(userProfile.showReviewsPublic);
    const showFavorites = isPublic(userProfile.showFavoritesPublic);
    const showMasterpieces = isPublic(userProfile.showMasterpiecesPublic);
    const showRating = isPublic(userProfile.showRatingPublic);

    const stats = await reviewRepository
      .createQueryBuilder("review")
      .select("COUNT(review.id)", "cnt")
      .addSelect("COALESCE(AVG(review.rating), 0)", "avgRating")
      .where("review.user_id = :userId", { userId })
      .andWhere("review.is_approved = 'Y'")
      .getRawOne<{ cnt: string; avgRating: string }>();

    const totalReviewCount = Number(stats?.cnt ?? 0);
    const averageRating =
      totalReviewCount > 0 ? parseFloat(Number(stats?.avgRating ?? 0).toFixed(1)) : 0;

    let userReviews: Review[] = [];
    if (showReviews) {
      userReviews = await reviewRepository.find({
        where: { userId, isApproved: "Y" },
        order: { createdAt: "DESC" },
        skip: offset,
        take: limit,
        relations: ["album"],
      });
    }

    let favorites: UserFavoriteAlbum[] = [];
    if (showFavorites) {
      favorites = await favoriteRepository.find({
        where: { userId },
        relations: ["album"],
        order: { createdAt: "DESC" },
        take: 6,
      });
    }

    let masterpieces: UserSlideAlbum[] = [];
    if (showMasterpieces) {
      masterpieces = await slideRepository.find({
        where: { userId },
        order: { position: "ASC" },
        take: 30,
      });
    }

    const createdAtText = userProfile.createdAt
      ? new Date(userProfile.createdAt).toLocaleString("ko-KR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-";

    return NextResponse.json({
      ok: true,
      data: {
        isOwner,
        privacy: {
          showReviewsPublic: isPublic(userProfile.showReviewsPublic),
          showFavoritesPublic: isPublic(userProfile.showFavoritesPublic),
          showMasterpiecesPublic: isPublic(userProfile.showMasterpiecesPublic),
          showRatingPublic: isPublic(userProfile.showRatingPublic),
        },
        profile: {
          id: userProfile.id,
          nickname: userProfile.nickname,
          name: null,
          email: null,
          profileImage: userProfile.profileImage ?? null,
          gender: userProfile.gender ?? null,
          role: null,
          createdAt: userProfile.createdAt,
          createdAtText,
          averageRating: showRating ? averageRating : 0,
        },
        totalReviewCount: showReviews ? totalReviewCount : 0,
        reviewsHidden: !showReviews,
        favoritesHidden: !showFavorites,
        masterpiecesHidden: !showMasterpieces,
        ratingHidden: !showRating,
        reviews: userReviews.map((review) => ({
          id: review.id,
          content: review.content,
          rating: Number(review.rating),
          isApproved: review.isApproved,
          rejectReason: review.rejectReason,
          albumId: review.albumId,
          createdAt: review.createdAt,
          updatedAt: review.updatedAt,
          album: review.album
            ? {
                albumId: review.album.albumId,
                title: review.album.title,
                artist: review.album.artist,
                imageUrl: review.album.imageUrl ?? null,
              }
            : null,
        })),
        favorites: favorites.map((fav) => ({
          id: fav.id,
          albumId: fav.albumId,
          createdAt: fav.createdAt,
          album: fav.album
            ? {
                albumId: fav.album.albumId,
                title: fav.album.title,
                artist: fav.album.artist,
                imageUrl: fav.album.imageUrl ?? null,
                releaseDate: fav.album.releaseDate ?? null,
              }
            : null,
        })),
        masterpieces: masterpieces.map((item) => ({
          id: item.id,
          position: item.position,
          collectionId: item.collectionId,
          title: item.title,
          artist: item.artist,
          imageUrl: item.imageUrl ?? null,
          releaseDate: item.releaseDate ?? "",
          genre: item.genre ?? "",
        })),
      },
    });
  } catch {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
