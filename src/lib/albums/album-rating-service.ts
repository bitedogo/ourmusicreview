/** 앨범 평점 집계 */

import type { DataSource } from "typeorm";
import { In } from "typeorm";
import { Review } from "@/src/lib/db/entities/Review";
import { ServiceError } from "@/src/lib/http/service-error";

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

  const summaryMap: Record<string, { sum: number; count: number }> = {};
  for (const review of approvedReviews) {
    const current = summaryMap[review.albumId] ?? { sum: 0, count: 0 };
    current.sum += review.rating;
    current.count += 1;
    summaryMap[review.albumId] = current;
  }

  const ratings: Record<string, AlbumRatingSummary> = {};
  for (const albumId of uniqueAlbumIds) {
    const summary = summaryMap[albumId];
    if (!summary || summary.count === 0) {
      ratings[albumId] = { averageRating: null, reviewCount: 0 };
      continue;
    }
    ratings[albumId] = {
      averageRating: Math.trunc((summary.sum / summary.count) * 10) / 10,
      reviewCount: summary.count,
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

  if (reviews.length === 0) {
    return { averageRating: null, reviewCount: 0 };
  }

  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return {
    averageRating: Math.trunc((sum / reviews.length) * 10) / 10,
    reviewCount: reviews.length,
  };
}
