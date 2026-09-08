/** 앨범 평점 집계 */

import type { DataSource } from "typeorm";
import { In } from "typeorm";
import { Review } from "@/src/lib/db/entities/Review";
import { ServiceError } from "@/src/lib/http/service-error";
import { averageFromRatings } from "@/src/lib/utils/rating";

export interface AlbumRatingSummary {
  averageRating: number | null;
  reviewCount: number;
}

function parseAlbumIds(raw: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((value) => value.trim())
    .filter((value) => value.length > 0)
    .slice(0, 100);
}

export async function getAlbumRatingsBatch(
  dataSource: DataSource,
  idsParam: string | null
) {
  const albumIds = parseAlbumIds(idsParam);
  if (albumIds.length === 0) {
    throw new ServiceError("조회할 앨범 ID가 필요합니다.", 400);
  }

  const uniqueAlbumIds = Array.from(new Set(albumIds));
  const approvedReviews = await dataSource.getRepository(Review).find({
    where: { albumId: In(uniqueAlbumIds) },
    select: ["albumId", "rating"],
  });

  const ratingsByAlbum = new Map<string, unknown[]>();
  for (const review of approvedReviews) {
    const list = ratingsByAlbum.get(review.albumId) ?? [];
    list.push(review.rating);
    ratingsByAlbum.set(review.albumId, list);
  }

  const ratings: Record<string, AlbumRatingSummary> = {};
  for (const albumId of uniqueAlbumIds) {
    const values = ratingsByAlbum.get(albumId) ?? [];
    const averageRating = averageFromRatings(values);
    ratings[albumId] = {
      averageRating,
      reviewCount: values.length,
    };
  }

  return { ratings };
}

export async function getAlbumRating(
  dataSource: DataSource,
  albumId: string
): Promise<AlbumRatingSummary> {
  if (!albumId) {
    throw new ServiceError("앨범 ID가 필요합니다.", 400);
  }

  const reviews = await dataSource.getRepository(Review).find({
    where: { albumId },
    select: ["rating"],
  });

  const values = reviews.map((review) => review.rating);
  return {
    averageRating: averageFromRatings(values),
    reviewCount: values.length,
  };
}
