/** 게시판 목록 조회 */

import type { DataSource } from "typeorm";
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
  isReleasePinned: boolean;
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

export async function listBoardPosts(
  dataSource: DataSource,
  params: BoardListParams
): Promise<BoardListResult> {
  const page = Math.max(1, params.page);
  const searchQuery = params.searchQuery.trim().slice(0, 100);
  const postRepository = dataSource.getRepository(Post);
  const commentRepository = dataSource.getRepository(Comment);

  const postsQueryBuilder = postRepository
    .createQueryBuilder("post")
    .orderBy("post.created_at", "DESC");

  if (params.category === "N") {
    postsQueryBuilder.where("post.category = :category", { category: "N" });
  } else {
    postsQueryBuilder.where(
      "(post.category = :category OR post.is_global = :isGlobal)",
      {
        category: params.category,
        isGlobal: "Y",
      }
    );
  }

  if (searchQuery) {
    if (params.searchField === "title") {
      postsQueryBuilder.andWhere("post.title ILIKE :keyword", {
        keyword: `%${searchQuery}%`,
      });
    } else {
      postsQueryBuilder.andWhere("post.nickname ILIKE :keyword", {
        keyword: `%${searchQuery}%`,
      });
    }
  }

  const allPosts = await postsQueryBuilder.getMany();
  const postIds = allPosts.map((post) => post.id);
  const commentCountRows =
    postIds.length > 0
      ? await commentRepository
          .createQueryBuilder("comment")
          .select("comment.post_id", "postId")
          .addSelect("COUNT(comment.id)", "count")
          .where({ postId: In(postIds) })
          .groupBy("comment.post_id")
          .getRawMany<{ postId: string; count: string }>()
      : [];

  const commentCountMap = new Map<string, number>(
    commentCountRows.map((row) => [row.postId, Number(row.count)])
  );

  const postsWithMeta = allPosts.map((post) => {
    const isReleasePinned =
      post.category !== "N" && post.noticeCategory === "RELEASE_NOTE";
    return {
      ...post,
      commentCount: commentCountMap.get(post.id) ?? 0,
      isPinned: post.isGlobal === "Y",
      isReleasePinned,
    };
  });

  const globalPinnedPosts = postsWithMeta.filter((post) => post.isPinned);
  const releasePinnedPosts = postsWithMeta
    .filter((post) => !post.isPinned && post.isReleasePinned)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 3);

  const otherPosts = postsWithMeta.filter(
    (post) => !post.isPinned && !post.isReleasePinned
  );

  const totalOtherPosts = otherPosts.length;
  const totalPages = Math.max(1, Math.ceil(totalOtherPosts / params.pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedOtherPosts = otherPosts.slice(
    (currentPage - 1) * params.pageSize,
    currentPage * params.pageSize
  );

  const rowNumberByPostId = new Map<string, number>(
    paginatedOtherPosts.map((post, index) => [
      post.id,
      totalOtherPosts - (currentPage - 1) * params.pageSize - index,
    ])
  );

  const posts: BoardListPostItem[] = [
    ...globalPinnedPosts,
    ...releasePinnedPosts,
    ...paginatedOtherPosts,
  ]
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      if (a.isReleasePinned && !a.isPinned && !b.isReleasePinned) return -1;
      if (!a.isReleasePinned && b.isReleasePinned && !b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .map((post) => ({
      id: post.id,
      title: post.title,
      nickname: post.nickname,
      createdAt: post.createdAt,
      commentCount: post.commentCount,
      isPinned: post.isPinned,
      isReleasePinned: post.isReleasePinned,
      noticeCategory: post.noticeCategory,
      rowNumber: rowNumberByPostId.get(post.id) ?? null,
    }));

  return {
    posts,
    totalOtherPosts,
    totalPages,
    currentPage,
    isEmpty:
      totalOtherPosts === 0 &&
      globalPinnedPosts.length === 0 &&
      releasePinnedPosts.length === 0,
  };
}
