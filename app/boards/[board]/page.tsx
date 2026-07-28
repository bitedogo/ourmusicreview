/** 게시판별 글 목록 페이지 */

import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { In } from "typeorm";
import { authOptions } from "@/src/lib/auth/config";
import { initializeDatabase } from "@/src/lib/db";
import { Post } from "@/src/lib/db/entities/Post";
import { Comment } from "@/src/lib/db/entities/Comment";
import { PaginationNav } from "@/src/components/common/PaginationNav";
import { BoardSearchControls } from "./board-search-controls";
import {
  BOARD_CONFIG,
  PAGE_SIZE_BOARD,
  type BoardSearchField,
  type BoardType,
} from "./board-config";
import { BoardHeader } from "./board-header";
import { BoardEmptyState } from "./board-empty-state";
import { BoardPostTable, type BoardPostRow } from "./board-post-table";

export default async function BoardPage(props: {
  params: Promise<{ board: BoardType }>;
  searchParams: Promise<{ page?: string; searchField?: string; q?: string }>;
}) {
  const { board } = await props.params;
  const {
    page: pageParam,
    searchField: rawSearchField,
    q: rawQuery,
  } = await props.searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const searchField: BoardSearchField =
    rawSearchField === "author" ? "author" : "title";
  const searchQuery = (rawQuery ?? "").trim().slice(0, 100);

  const config = BOARD_CONFIG[board];
  if (!config) {
    notFound();
  }

  const session = await getServerSession(authOptions);
  const isSignedIn = Boolean(session?.user?.id);

  const dataSource = await initializeDatabase();
  const postRepository = dataSource.getRepository(Post);
  const commentRepository = dataSource.getRepository(Comment);

  const postsQueryBuilder = postRepository
    .createQueryBuilder("post")
    .orderBy("post.created_at", "DESC");

  if (config.category === "N") {
    postsQueryBuilder.where("post.category = :category", { category: "N" });
  } else {
    postsQueryBuilder.where(
      "(post.category = :category OR post.is_global = :isGlobal)",
      {
        category: config.category,
        isGlobal: "Y",
      }
    );
  }

  if (searchQuery) {
    if (searchField === "title") {
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
          .where({
            postId: In(postIds),
          })
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
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  const otherPosts = postsWithMeta.filter(
    (post) => !post.isPinned && !post.isReleasePinned
  );

  const totalOtherPosts = otherPosts.length;
  const totalPages = Math.max(1, Math.ceil(totalOtherPosts / PAGE_SIZE_BOARD));
  const currentPage = Math.min(page, totalPages);
  const paginatedOtherPosts = otherPosts.slice(
    (currentPage - 1) * PAGE_SIZE_BOARD,
    currentPage * PAGE_SIZE_BOARD
  );

  const rowNumberByPostId = new Map<string, number>(
    paginatedOtherPosts.map((post, index) => [
      post.id,
      totalOtherPosts - (currentPage - 1) * PAGE_SIZE_BOARD - index,
    ])
  );

  const finalPostsToRender: BoardPostRow[] = [
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

  const canWrite = Boolean(
    config.adminOnlyWrite
      ? session?.user && (session.user as { role?: string }).role === "ADMIN"
      : isSignedIn
  );
  const writeHref = canWrite
    ? `/community/write?category=${encodeURIComponent(config.category)}`
    : config.adminOnlyWrite
      ? "#"
      : `/auth/signin?callbackUrl=${encodeURIComponent(
          `/community/write?category=${config.category}`
        )}`;

  function buildBoardHref(nextPage: number): string {
    const params = new URLSearchParams();
    params.set("page", String(nextPage));
    if (searchQuery) {
      params.set("searchField", searchField);
      params.set("q", searchQuery);
    }
    return `/boards/${board}?${params.toString()}`;
  }

  const isEmpty =
    totalOtherPosts === 0 &&
    globalPinnedPosts.length === 0 &&
    releasePinnedPosts.length === 0;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-4 py-10 sm:px-10">
      <BoardHeader
        title={config.title}
        descriptionHtml={config.description}
        canWrite={canWrite}
        writeHref={writeHref}
      />

      <section>
        {isEmpty ? (
          <BoardEmptyState searchQuery={searchQuery} />
        ) : (
          <>
            <BoardPostTable
              posts={finalPostsToRender}
              isNoticeBoard={config.category === "N"}
            />
            <div className="mt-4">
              {config.category !== "N" && (
                <div className="mb-3 flex justify-start">
                  <BoardSearchControls
                    board={board}
                    initialSearchField={searchField}
                    initialQuery={searchQuery}
                  />
                </div>
              )}
              {totalPages > 1 && (
                <div className="flex justify-center">
                  <PaginationNav
                    currentPage={currentPage}
                    totalPages={totalPages}
                    buildHref={buildBoardHref}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
