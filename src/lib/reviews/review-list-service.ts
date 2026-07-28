/** 리뷰 목록 조회(필터·정렬·페이지네이션) 비즈니스 로직 */

import type { DataSource, SelectQueryBuilder } from "typeorm";
import { Review } from "@/src/lib/db/entities/Review";
import { Like } from "@/src/lib/db/entities/Like";
import { Comment } from "@/src/lib/db/entities/Comment";

const SORT_VALUES = ["latest", "likes", "comments"] as const;
type SortType = (typeof SORT_VALUES)[number];
const SEARCH_FIELDS = ["artist", "album", "author"] as const;
type SearchField = (typeof SEARCH_FIELDS)[number];

const PAGE_SIZE_ALBUM_REVIEWS = 6;

export interface ReviewListParams {
  sort: string | null;
  page: string | null;
  searchField: string | null;
  q: string | null;
}

export interface ReviewListItem {
  id: string;
  content: string;
  rating: number;
  albumId: string;
  createdAt: Date;
  likeCount: number;
  commentCount: number;
  album: {
    albumId: string;
    title: string;
    artist: string;
    imageUrl?: string | null;
  } | null;
  user: { id: string; nickname: string } | null;
}

export interface ReviewListResult {
  reviews: ReviewListItem[];
  sort: SortType;
  searchField: SearchField;
  q: string;
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
}

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

function parseSearchField(value: string | null): SearchField {
  if (value && SEARCH_FIELDS.includes(value as SearchField)) {
    return value as SearchField;
  }
  return "artist";
}

function parseSearchQuery(value: string | null): string {
  if (!value) return "";
  return value.trim().slice(0, 100);
}

function applySearchCondition(
  qb: SelectQueryBuilder<Review>,
  searchField: SearchField,
  searchQuery: string
) {
  if (!searchQuery) return qb;
  const keyword = `%${searchQuery.toLowerCase()}%`;
  if (searchField === "artist") {
    qb.andWhere("LOWER(album.artist) LIKE :keyword", { keyword });
  } else if (searchField === "album") {
    qb.andWhere("LOWER(album.title) LIKE :keyword", { keyword });
  } else {
    qb.andWhere("LOWER(\"user\".nickname) LIKE :keyword", { keyword });
  }
  return qb;
}

export async function getReviewList(
  dataSource: DataSource,
  params: ReviewListParams
): Promise<ReviewListResult> {
  const sort = parseSort(params.sort);
  const page = parsePage(params.page);
  const searchField = parseSearchField(params.searchField);
  const searchQuery = parseSearchQuery(params.q);

  const reviewRepository = dataSource.getRepository(Review);
  const likeRepository = dataSource.getRepository(Like);
  const commentRepository = dataSource.getRepository(Comment);

  const totalQueryBuilder = reviewRepository
    .createQueryBuilder("r")
    .leftJoin("r.album", "album")
    .leftJoin("r.user", "user")
    .where("1 = 1");
  applySearchCondition(totalQueryBuilder, searchField, searchQuery);
  const total = await totalQueryBuilder.getCount();
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE_ALBUM_REVIEWS));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE_ALBUM_REVIEWS;

  let orderedIds: string[] = [];

  if (sort === "latest") {
    const latestQueryBuilder = reviewRepository
      .createQueryBuilder("r")
      .leftJoin("r.album", "album")
      .leftJoin("r.user", "user")
      .where("1 = 1")
      .select("r.id", "id")
      .orderBy("r.created_at", "DESC")
      .offset(start)
      .limit(PAGE_SIZE_ALBUM_REVIEWS);
    applySearchCondition(latestQueryBuilder, searchField, searchQuery);
    const rows = await latestQueryBuilder.getRawMany<{ id: string }>();
    orderedIds = rows.map((row) => row.id);
  } else if (sort === "likes") {
    const likesQueryBuilder = reviewRepository
      .createQueryBuilder("r")
      .leftJoin("r.album", "album")
      .leftJoin("r.user", "user")
      .leftJoin(Like, "l", "l.review_id = r.id")
      .where("1 = 1")
      .select("r.id", "id")
      .addSelect("COUNT(l.id)", "metric")
      .groupBy("r.id")
      .orderBy("metric", "DESC")
      .addOrderBy("r.created_at", "DESC")
      .offset(start)
      .limit(PAGE_SIZE_ALBUM_REVIEWS);
    applySearchCondition(likesQueryBuilder, searchField, searchQuery);
    const rows = await likesQueryBuilder.getRawMany<{ id: string }>();
    orderedIds = rows.map((row) => row.id);
  } else {
    const commentsQueryBuilder = reviewRepository
      .createQueryBuilder("r")
      .leftJoin("r.album", "album")
      .leftJoin("r.user", "user")
      .leftJoin(Comment, "c", "c.review_id = r.id")
      .where("1 = 1")
      .select("r.id", "id")
      .addSelect("COUNT(c.id)", "metric")
      .groupBy("r.id")
      .orderBy("metric", "DESC")
      .addOrderBy("r.created_at", "DESC")
      .offset(start)
      .limit(PAGE_SIZE_ALBUM_REVIEWS);
    applySearchCondition(commentsQueryBuilder, searchField, searchQuery);
    const rows = await commentsQueryBuilder.getRawMany<{ id: string }>();
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

  return {
    reviews,
    sort,
    searchField,
    q: searchQuery,
    page: currentPage,
    totalPages,
    total,
    pageSize: PAGE_SIZE_ALBUM_REVIEWS,
  };
}
