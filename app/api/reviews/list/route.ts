import { NextRequest, NextResponse } from "next/server";
import { initializeDatabase } from "@/src/lib/db";
import { Review } from "@/src/lib/db/entities/Review";
import { Like } from "@/src/lib/db/entities/Like";
import { Comment } from "@/src/lib/db/entities/Comment";

const SORT_VALUES = ["latest", "likes", "comments"] as const;
type SortType = (typeof SORT_VALUES)[number];

const PAGE_SIZE_ALBUM_REVIEWS = 10;

function parseSort(value: string | null): SortType {
  if (value && SORT_VALUES.includes(value as SortType)) {
    return value as SortType;
  }
  return "latest";
}

function parsePage(value: string | null): number {
  const n = value ? parseInt(value, 10) : NaN;
  return Number.isFinite(n) && n >= 1 ? n : 1;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sort = parseSort(searchParams.get("sort"));
    const page = parsePage(searchParams.get("page"));

    const dataSource = await initializeDatabase();
    const reviewRepository = dataSource.getRepository(Review);
    const likeRepository = dataSource.getRepository(Like);
    const commentRepository = dataSource.getRepository(Comment);

    const reviews = await reviewRepository.find({
      where: { isApproved: "Y" },
      relations: ["album", "user"],
      order: { createdAt: "DESC" },
    });

    const reviewIds = reviews.map((r) => r.id);

    const [likeCounts, commentCounts] = await Promise.all([
      reviewIds.length > 0
        ? likeRepository
            .createQueryBuilder("l")
            .select("l.review_id", "reviewId")
            .addSelect("COUNT(*)::int", "count")
            .where("l.review_id IN (:...ids)", { ids: reviewIds })
            .groupBy("l.review_id")
            .getRawMany<{ reviewId: string; count: number }>()
        : [],
      reviewIds.length > 0
        ? commentRepository
            .createQueryBuilder("c")
            .select("c.review_id", "reviewId")
            .addSelect("COUNT(*)::int", "count")
            .where("c.review_id IN (:...ids)", { ids: reviewIds })
            .groupBy("c.review_id")
            .getRawMany<{ reviewId: string; count: number }>()
        : [],
    ]);

    const likeMap = new Map<string, number>();
    likeCounts.forEach((row) => likeMap.set(row.reviewId, Number(row.count)));
    const commentMap = new Map<string, number>();
    commentCounts.forEach((row) => commentMap.set(row.reviewId, Number(row.count)));

    const withCounts = reviews.map((review) => ({
      id: review.id,
      content: review.content,
      rating: review.rating,
      albumId: review.albumId,
      createdAt: review.createdAt,
      likeCount: likeMap.get(review.id) ?? 0,
      commentCount: commentMap.get(review.id) ?? 0,
      album: review.album
        ? {
            albumId: review.album.albumId,
            title: review.album.title,
            artist: review.album.artist,
            imageUrl: review.album.imageUrl,
          }
        : null,
      user: review.user
        ? { id: review.user.id, nickname: review.user.nickname }
        : null,
    }));

    if (sort === "likes") {
      withCounts.sort((a, b) => b.likeCount - a.likeCount);
    } else if (sort === "comments") {
      withCounts.sort((a, b) => b.commentCount - a.commentCount);
    }

    const total = withCounts.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE_ALBUM_REVIEWS));
    const currentPage = Math.min(page, totalPages);
    const start = (currentPage - 1) * PAGE_SIZE_ALBUM_REVIEWS;
    const paginated = withCounts.slice(start, start + PAGE_SIZE_ALBUM_REVIEWS);

    return NextResponse.json(
      {
        ok: true,
        reviews: paginated,
        sort,
        page: currentPage,
        totalPages,
        total,
        pageSize: PAGE_SIZE_ALBUM_REVIEWS,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "리뷰 목록을 불러오는 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
