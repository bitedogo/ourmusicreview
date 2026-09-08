/** Featured 앨범 조회 비즈니스 로직 */

import { In, type DataSource } from "typeorm";
import { FeaturedSlideAlbum } from "@/src/lib/db/entities/FeaturedSlideAlbum";
import { Review } from "@/src/lib/db/entities/Review";
import { UserSlideAlbum } from "@/src/lib/db/entities/UserSlideAlbum";
import type { FeaturedAlbumCardData } from "@/src/lib/featured-albums/types";
import { averageFromRatings } from "@/src/lib/utils/rating";

const MIN_FOR_USER_SLIDE = 15;

export interface FeaturedAlbumsResult {
  albums: FeaturedAlbumCardData[];
  hasUserSlide: boolean;
}

export async function getFeaturedAlbums(
  dataSource: DataSource,
  options: { userId?: string | null; forceAdmin?: boolean } = {}
): Promise<FeaturedAlbumsResult> {
  const featuredRepo = dataSource.getRepository(FeaturedSlideAlbum);
  const userSlideRepo = dataSource.getRepository(UserSlideAlbum);
  const reviewRepo = dataSource.getRepository(Review);
  const userId = options.userId ?? null;

  let rows: Array<{
    collectionId: string;
    title: string;
    artist: string;
    imageUrl?: string;
    releaseDate?: string;
    genre?: string;
  }>;
  let hasUserSlide = false;

  if (userId) {
    const userRows = await userSlideRepo.find({
      where: { userId },
      order: { position: "ASC" },
    });
    hasUserSlide = userRows.length >= MIN_FOR_USER_SLIDE;
    rows =
      hasUserSlide && !options.forceAdmin
        ? userRows
        : await featuredRepo.find({ order: { position: "ASC" } });
  } else {
    rows = await featuredRepo.find({ order: { position: "ASC" } });
  }

  const collectionIds = rows.map((row) => row.collectionId);
  const ratingsByAlbumId: Record<string, number> = {};

  if (collectionIds.length > 0) {
    const reviews = await reviewRepo.find({
      where: { albumId: In(collectionIds) },
      select: ["albumId", "rating"],
    });
    const byAlbum = new Map<string, unknown[]>();
    for (const review of reviews) {
      const ratings = byAlbum.get(review.albumId) ?? [];
      ratings.push(review.rating);
      byAlbum.set(review.albumId, ratings);
    }
    byAlbum.forEach((ratings, albumId) => {
      const average = averageFromRatings(ratings);
      if (average != null) ratingsByAlbumId[albumId] = average;
    });
  }

  return {
    albums: rows.map((row) => ({
      collectionId: row.collectionId,
      title: row.title,
      artist: row.artist,
      imageUrl: row.imageUrl ?? null,
      releaseDate: row.releaseDate ?? "",
      genre: row.genre ?? "",
      averageRating: ratingsByAlbumId[row.collectionId] ?? null,
    })),
    hasUserSlide,
  };
}
