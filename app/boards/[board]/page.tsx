/** 게시판별 글 목록 페이지 */

import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth/config";
import { listBoardPosts } from "@/src/lib/community/board-post-service";
import {
  BOARD_CONFIG,
  PAGE_SIZE_BOARD,
  isBoardSlug,
  type BoardSearchField,
} from "@/src/lib/community/board-config";
import { initializeDatabase } from "@/src/lib/db";
import { PaginationNav } from "@/src/components/common/PaginationNav";
import { buildSigninHref } from "@/src/lib/auth/callback-url";
import { boardPath } from "@/src/lib/navigation/routes";
import { BoardSearchControls } from "./board-search-controls";
import { BoardHeader } from "./board-header";
import { BoardEmptyState } from "./board-empty-state";
import { BoardFeedComposer } from "./board-feed-composer";
import { BoardPostFeed } from "./board-post-feed";
import { BoardPostTable } from "./board-post-table";

export default async function BoardPage(props: {
  params: Promise<{ board: string }>;
  searchParams: Promise<{ page?: string; searchField?: string; q?: string }>;
}) {
  const { board } = await props.params;
  if (!isBoardSlug(board)) {
    notFound();
  }
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

  const session = await getServerSession(authOptions);
  const isSignedIn = Boolean(session?.user?.id);

  const dataSource = await initializeDatabase();
  const list = await listBoardPosts(dataSource, {
    category: config.category,
    page,
    pageSize: PAGE_SIZE_BOARD,
    searchField,
    searchQuery,
    viewerUserId: session?.user?.id ?? null,
  });

  const isAdminUser =
    (session?.user as { role?: string } | undefined)?.role === "ADMIN";
  const writePath = `/community/write?category=${encodeURIComponent(config.category)}`;
  const canWriteNow = config.adminOnlyWrite ? isAdminUser : isSignedIn;
  const showWriteButton = config.adminOnlyWrite ? isAdminUser : true;
  const writeHref = canWriteNow ? writePath : buildSigninHref(writePath);

  function buildBoardHref(nextPage: number): string {
    const params = new URLSearchParams();
    params.set("page", String(nextPage));
    if (searchQuery) {
      params.set("searchField", searchField);
      params.set("q", searchQuery);
    }
    return `${boardPath(board)}?${params.toString()}`;
  }

  const isFeed = config.listLayout === "feed";

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-4 py-10 sm:px-10">
      <BoardHeader
        title={config.title}
        descriptionHtml={config.description}
        canWrite={showWriteButton && !isFeed}
        writeHref={writeHref}
      />

      <section>
        {isFeed ? (
          <>
            <BoardPostFeed
              posts={list.posts}
              composer={
                <BoardFeedComposer
                  category={config.category}
                  writeHref={writeHref}
                />
              }
            />
            {list.isEmpty ? (
              <div className="mt-4">
                <BoardEmptyState searchQuery={searchQuery} />
              </div>
            ) : null}
          </>
        ) : list.isEmpty ? (
          <BoardEmptyState searchQuery={searchQuery} />
        ) : (
          <BoardPostTable
            posts={list.posts}
            isNoticeBoard={config.category === "N"}
          />
        )}
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
          {!list.isEmpty && list.totalPages > 1 && (
            <div className="flex justify-center">
              <PaginationNav
                currentPage={list.currentPage}
                totalPages={list.totalPages}
                buildHref={buildBoardHref}
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
