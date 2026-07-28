/** GET Featured 앨범 슬라이드 */

import { In } from "typeorm";
import { getAppSession } from "@/src/lib/auth/session";
import { initializeDatabase } from "@/src/lib/db";
import { FeaturedSlideAlbum } from "@/src/lib/db/entities/FeaturedSlideAlbum";
import { UserSlideAlbum } from "@/src/lib/db/entities/UserSlideAlbum";
import { Review } from "@/src/lib/db/entities/Review";
import { apiError, apiOk } from "@/src/lib/http/response";

const MIN_FOR_USER_SLIDE = 15;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const forceAdmin = searchParams.get("source") === "admin";

    const session = await getAppSession();
    const userId = session?.user?.id;

    const dataSource = await initializeDatabase();
    const featuredRepo = dataSource.getRepository(FeaturedSlideAlbum);
    const userSlideRepo = dataSource.getRepository(UserSlideAlbum);
    const reviewRepo = dataSource.getRepository(Review);

    let rows: { collectionId: string; title: string; artist: string; imageUrl?: string; releaseDate?: string; genre?: string }[];
    let hasUserSlide = false;

    if (userId) {
      const userRows = await userSlideRepo.find({
        where: { userId },
        order: { position: "ASC" },
      });
      hasUserSlide = userRows.length >= MIN_FOR_USER_SLIDE;
      if (hasUserSlide && !forceAdmin) {
        rows = userRows;
      } else {
        rows = await featuredRepo.find({ order: { position: "ASC" } });
      }
    } else {
      rows = await featuredRepo.find({ order: { position: "ASC" } });
    }

    const collectionIds = rows.map((r) => r.collectionId);
    const ratingsByAlbumId: Record<string, number> = {};

    if (collectionIds.length > 0) {
      const reviews = await reviewRepo.find({
        where: { albumId: In(collectionIds) },
        select: ["albumId", "rating"],
      });
      const byAlbum = new Map<string, number[]>();
      for (const r of reviews) {
        const list = byAlbum.get(r.albumId) ?? [];
        list.push(Number(r.rating));
        byAlbum.set(r.albumId, list);
      }
      byAlbum.forEach((ratings, albumId) => {
        const sum = ratings.reduce((a, b) => a + b, 0);
        ratingsByAlbumId[albumId] = Math.trunc((sum / ratings.length) * 10) / 10;
      });
    }

    const albums = rows.map((row) => ({
      collectionId: row.collectionId,
      title: row.title,
      artist: row.artist,
      imageUrl: row.imageUrl ?? null,
      releaseDate: row.releaseDate ?? "",
      genre: row.genre ?? "",
      averageRating: ratingsByAlbumId[row.collectionId] ?? null,
    }));

    return apiOk({ albums, hasUserSlide });
  } catch (error) {
    return apiError(
      error instanceof Error
        ? error.message
        : "명반 목록 조회 중 오류가 발생했습니다.",
      { status: 500 }
    );
  }
}
