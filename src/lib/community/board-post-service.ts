/** 게시판 목록 조회 */

import type { DataSource, Repository, SelectQueryBuilder } from "typeorm";
import { In, IsNull } from "typeorm";
import type { BoardSearchField } from "@/src/lib/community/board-config";
import type { NoticeCategory } from "@/src/lib/community/types";
import { Comment } from "@/src/lib/db/entities/Comment";
import { Like } from "@/src/lib/db/entities/Like";
import { Post, type PostCategory } from "@/src/lib/db/entities/Post";
import { User } from "@/src/lib/db/entities/User";
import { getFirstHtmlImageSrc, getHtmlPreview } from "@/src/lib/utils/editor";

export type { BoardSearchField };

export interface BoardListParams {
  category: PostCategory;
  page: number;
  pageSize: number;
  searchField: BoardSearchField;
  searchQuery: string;
  viewerUserId?: string | null;
}

export interface BoardListPostItem {
  id: string;
  title: string;
  nickname: string;
  userId: string;
  profileImage: string | null;
  excerptHtml: string;
  imageUrl: string | null;
  createdAt: Date;
  commentCount: number;
  likeCount: number;
  liked: boolean;
  isPinned: boolean;
  noticeCategory: NoticeCategory | null;
  rowNumber: number | null;
}

export interface BoardListResult {
  posts: BoardListPostItem[];
  totalOtherPosts: number;
  totalPages: number;
  currentPage: number;
  isEmpty: boolean;
}

function applySearchFilter(
  query: SelectQueryBuilder<Post>,
  searchField: BoardSearchField,
  searchQuery: string
): void {
  if (!searchQuery) return;
  if (searchField === "title") {
    query.andWhere("post.title ILIKE :keyword", {
      keyword: `%${searchQuery}%`,
    });
    return;
  }
  query.andWhere("post.nickname ILIKE :keyword", {
    keyword: `%${searchQuery}%`,
  });
}

function createPinnedQuery(
  postRepository: Repository<Post>,
  params: BoardListParams,
  searchQuery: string
) {
  const query = postRepository
    .createQueryBuilder("post")
    .where("post.is_global = :isGlobal", { isGlobal: "Y" })
    .orderBy("post.created_at", "DESC");

  if (params.category === "N") {
    query.andWhere("post.category = :category", { category: "N" });
  }

  applySearchFilter(query, params.searchField, searchQuery);
  return query;
}

function createOtherQuery(
  postRepository: Repository<Post>,
  params: BoardListParams,
  searchQuery: string
) {
  const query = postRepository
    .createQueryBuilder("post")
    .where("post.category = :category", { category: params.category })
    .andWhere("post.is_global = :isGlobal", { isGlobal: "N" })
    .orderBy("post.created_at", "DESC");

  applySearchFilter(query, params.searchField, searchQuery);
  return query;
}

async function loadCommentCounts(
  commentRepository: Repository<Comment>,
  postIds: string[]
): Promise<Map<string, number>> {
  if (postIds.length === 0) return new Map();

  const commentCountRows = await commentRepository
    .createQueryBuilder("comment")
    .select("comment.post_id", "postId")
    .addSelect("COUNT(comment.id)", "count")
    .where({ postId: In(postIds) })
    .groupBy("comment.post_id")
    .getRawMany<{ postId: string; count: string }>();

  return new Map(
    commentCountRows.map((row) => [row.postId, Number(row.count)])
  );
}

async function loadLikeCounts(
  likeRepository: Repository<Like>,
  postIds: string[]
): Promise<Map<string, number>> {
  if (postIds.length === 0) return new Map();

  const likeCountRows = await likeRepository
    .createQueryBuilder("like")
    .select("like.post_id", "postId")
    .addSelect("COUNT(*)::int", "count")
    .where("like.post_id IN (:...postIds)", { postIds })
    .andWhere("like.comment_id IS NULL")
    .groupBy("like.post_id")
    .getRawMany<{ postId: string; count: string | number }>();

  return new Map(
    likeCountRows.map((row) => [row.postId, Number(row.count)])
  );
}

async function loadLikedPostIds(
  likeRepository: Repository<Like>,
  postIds: string[],
  viewerUserId?: string | null
): Promise<Set<string>> {
  if (!viewerUserId || postIds.length === 0) return new Set();

  const rows = await likeRepository.find({
    where: {
      userId: viewerUserId,
      postId: In(postIds),
      commentId: IsNull(),
    },
    select: ["postId"],
  });

  return new Set(
    rows
      .map((row) => row.postId)
      .filter((postId): postId is string => Boolean(postId))
  );
}

async function loadProfileImages(
  userRepository: Repository<User>,
  userIds: string[]
): Promise<Map<string, string | null>> {
  const uniqueIds = [...new Set(userIds.filter(Boolean))];
  if (uniqueIds.length === 0) return new Map();

  const users = await userRepository.find({
    where: { id: In(uniqueIds) },
    select: ["id", "profileImage"],
  });

  return new Map(
    users.map((user) => [user.id, user.profileImage ?? null])
  );
}

function toListItem(
  post: Post,
  commentCount: number,
  likeCount: number,
  liked: boolean,
  isPinned: boolean,
  rowNumber: number | null,
  profileImage: string | null
): BoardListPostItem {
  return {
    id: post.id,
    title: post.title,
    nickname: post.nickname,
    userId: post.userId,
    profileImage,
    excerptHtml: getHtmlPreview(post.content ?? ""),
    imageUrl: getFirstHtmlImageSrc(post.content ?? ""),
    createdAt: post.createdAt,
    commentCount,
    likeCount,
    liked,
    isPinned,
    noticeCategory: post.noticeCategory,
    rowNumber,
  };
}

export async function listBoardPosts(
  dataSource: DataSource,
  params: BoardListParams
): Promise<BoardListResult> {
  const page = Math.max(1, params.page);
  const searchQuery = params.searchQuery.trim().slice(0, 100);
  const postRepository = dataSource.getRepository(Post);
  const commentRepository = dataSource.getRepository(Comment);
  const likeRepository = dataSource.getRepository(Like);
  const userRepository = dataSource.getRepository(User);

  const pinnedPosts = await createPinnedQuery(
    postRepository,
    params,
    searchQuery
  ).getMany();

  const otherBaseQuery = createOtherQuery(postRepository, params, searchQuery);
  const totalOtherPosts = await otherBaseQuery.clone().getCount();
  const totalPages = Math.max(1, Math.ceil(totalOtherPosts / params.pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedOtherPosts = await otherBaseQuery
    .clone()
    .skip((currentPage - 1) * params.pageSize)
    .take(params.pageSize)
    .getMany();

  const listedPosts = [...pinnedPosts, ...paginatedOtherPosts];
  const listedPostIds = listedPosts.map((post) => post.id);
  const [commentCountMap, likeCountMap, likedPostIds, profileImageMap] =
    await Promise.all([
      loadCommentCounts(commentRepository, listedPostIds),
      loadLikeCounts(likeRepository, listedPostIds),
      loadLikedPostIds(likeRepository, listedPostIds, params.viewerUserId),
      loadProfileImages(
        userRepository,
        listedPosts.map((post) => post.userId)
      ),
    ]);

  const rowNumberByPostId = new Map<string, number>(
    paginatedOtherPosts.map((post, index) => [
      post.id,
      totalOtherPosts - (currentPage - 1) * params.pageSize - index,
    ])
  );

  const posts: BoardListPostItem[] = [
    ...pinnedPosts.map((post) =>
      toListItem(
        post,
        commentCountMap.get(post.id) ?? 0,
        likeCountMap.get(post.id) ?? 0,
        likedPostIds.has(post.id),
        true,
        null,
        profileImageMap.get(post.userId) ?? null
      )
    ),
    ...paginatedOtherPosts.map((post) =>
      toListItem(
        post,
        commentCountMap.get(post.id) ?? 0,
        likeCountMap.get(post.id) ?? 0,
        likedPostIds.has(post.id),
        false,
        rowNumberByPostId.get(post.id) ?? null,
        profileImageMap.get(post.userId) ?? null
      )
    ),
  ];

  return {
    posts,
    totalOtherPosts,
    totalPages,
    currentPage,
    isEmpty: totalOtherPosts === 0 && pinnedPosts.length === 0,
  };
}
