import { NextRequest } from "next/server";
import { initializeDatabase } from "@/src/lib/db";
import { Review } from "@/src/lib/db/entities/Review";
import { Like } from "@/src/lib/db/entities/Like";
import { Comment } from "@/src/lib/db/entities/Comment";
import { noStoreJson, publicCachedJson } from "@/src/lib/http/cache";

const SORT_VALUES = ["latest", "likes", "comments"] as const;
type SortType = (typeof SORT_VALUES)[number];

const PAGE_SIZE_ALBUM_REVIEWS = 6;

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

    const total = await reviewRepository.count({ where: { isApproved: "Y" } });
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE_ALBUM_REVIEWS));
    const currentPage = Math.min(page, totalPages);
    const start = (currentPage - 1) * PAGE_SIZE_ALBUM_REVIEWS;

    let orderedIds: string[] = [];

    if (sort === "latest") {
      const pageReviews = await reviewRepository.find({
        where: { isApproved: "Y" },
        select: ["id"],
        order: { createdAt: "DESC" },
        skip: start,
        take: PAGE_SIZE_ALBUM_REVIEWS,
      });
      orderedIds = pageReviews.map((review) => review.id);
    } else if (sort === "likes") {
      const rows = await reviewRepository
        .createQueryBuilder("r")
        .leftJoin(Like, "l", "l.review_id = r.id")
        .where("r.isApproved = :approved", { approved: "Y" })
        .select("r.id", "id")
        .addSelect("COUNT(l.id)", "metric")
        .groupBy("r.id")
        .orderBy("metric", "DESC")
        .addOrderBy("r.created_at", "DESC")
        .offset(start)
        .limit(PAGE_SIZE_ALBUM_REVIEWS)
        .getRawMany<{ id: string }>();
      orderedIds = rows.map((row) => row.id);
    } else {
      const rows = await reviewRepository
        .createQueryBuilder("r")
        .leftJoin(Comment, "c", "c.review_id = r.id")
        .where("r.isApproved = :approved", { approved: "Y" })
        .select("r.id", "id")
        .addSelect("COUNT(c.id)", "metric")
        .groupBy("r.id")
        .orderBy("metric", "DESC")
        .addOrderBy("r.created_at", "DESC")
        .offset(start)
        .limit(PAGE_SIZE_ALBUM_REVIEWS)
        .getRawMany<{ id: string }>();
      orderedIds = rows.map((row) => row.id);
    }

    const pageReviews = orderedIds.length
      ? await reviewRepository
          .createQueryBuilder("r")
          .leftJoinAndSelect("r.album", "album")
          .leftJoinAndSelect("r.user", "user")
          .where("r.id IN (:...ids)", { ids: orderedIds })
          .getMany()
      : [];

    const [likeCounts, commentCounts] = await Promise.all([
      orderedIds.length > 0
        ? likeRepository
            .createQueryBuilder("l")
            .select("l.review_id", "reviewId")
            .addSelect("COUNT(*)::int", "count")
            .where("l.review_id IN (:...ids)", { ids: orderedIds })
            .groupBy("l.review_id")
            .getRawMany<{ reviewId: string; count: number }>()
        : [],
      orderedIds.length > 0
        ? commentRepository
            .createQueryBuilder("c")
            .select("c.review_id", "reviewId")
            .addSelect("COUNT(*)::int", "count")
            .where("c.review_id IN (:...ids)", { ids: orderedIds })
            .groupBy("c.review_id")
            .getRawMany<{ reviewId: string; count: number }>()
        : [],
    ]);

    const likeMap = new Map<string, number>();
    likeCounts.forEach((row) => likeMap.set(row.reviewId, Number(row.count)));
    const commentMap = new Map<string, number>();
    commentCounts.forEach((row) => commentMap.set(row.reviewId, Number(row.count)));
    const reviewById = new Map(pageReviews.map((review) => [review.id, review]));

    const reviews = orderedIds
      .map((id) => reviewById.get(id))
      .filter((review): review is Review => Boolean(review))
      .map((review) => ({
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

    return publicCachedJson(
      {
        ok: true,
        reviews,
        sort,
        page: currentPage,
        totalPages,
        total,
        pageSize: PAGE_SIZE_ALBUM_REVIEWS,
      },
      20,
      60
    );
  } catch (error) {
    return noStoreJson(
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
