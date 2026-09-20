/** 게시판 목록 조회 */

import type { DataSource, Repository, SelectQueryBuilder } from "typeorm";
import { In } from "typeorm";
import type { NoticeCategory } from "@/src/lib/community/types";
import { Comment } from "@/src/lib/db/entities/Comment";
import { Post, type PostCategory } from "@/src/lib/db/entities/Post";

export type BoardSearchField = "title" | "author";

export interface BoardListParams {
  category: PostCategory;
  page: number;
  pageSize: number;
  searchField: BoardSearchField;
  searchQuery: string;
}

export interface BoardListPostItem {
  id: string;
  title: string;
  nickname: string;
  createdAt: Date;
  commentCount: number;
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

function toListItem(
  post: Post,
  commentCount: number,
  isPinned: boolean,
  rowNumber: number | null
): BoardListPostItem {
  return {
    id: post.id,
    title: post.title,
    nickname: post.nickname,
    createdAt: post.createdAt,
    commentCount,
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

  const commentCountMap = await loadCommentCounts(commentRepository, [
    ...pinnedPosts.map((post) => post.id),
    ...paginatedOtherPosts.map((post) => post.id),
  ]);

  const rowNumberByPostId = new Map<string, number>(
    paginatedOtherPosts.map((post, index) => [
      post.id,
      totalOtherPosts - (currentPage - 1) * params.pageSize - index,
    ])
  );

  const posts: BoardListPostItem[] = [
    ...pinnedPosts.map((post) =>
      toListItem(post, commentCountMap.get(post.id) ?? 0, true, null)
    ),
    ...paginatedOtherPosts.map((post) =>
      toListItem(
        post,
        commentCountMap.get(post.id) ?? 0,
        false,
        rowNumberByPostId.get(post.id) ?? null
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
