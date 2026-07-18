/** GET 앨범 평점 일괄 조회 */

import { In } from "typeorm";
import { initializeDatabase } from "@/src/lib/db";
import { Review } from "@/src/lib/db/entities/Review";
import { apiError, apiOk } from "@/src/lib/http/response";

interface AlbumRatingSummary {
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const albumIds = parseAlbumIds(searchParams.get("ids"));

    if (albumIds.length === 0) {
      return apiError("조회할 앨범 ID가 필요합니다.", { status: 400 });
    }

    const uniqueAlbumIds = Array.from(new Set(albumIds));
    const dataSource = await initializeDatabase();
    const reviewRepository = dataSource.getRepository(Review);

    const approvedReviews = await reviewRepository.find({
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

    return apiOk({ ratings });
  } catch {
    return apiError("앨범 평점 일괄 조회 중 오류가 발생했습니다.", { status: 500 });
  }
}
