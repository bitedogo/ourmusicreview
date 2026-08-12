/** 게시판별 글 목록 페이지 */

import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth/config";
import { listBoardPosts } from "@/src/lib/community/board-post-service";
import { initializeDatabase } from "@/src/lib/db";
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
import { BoardPostTable } from "./board-post-table";

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
  const list = await listBoardPosts(dataSource, {
    category: config.category,
    page,
    pageSize: PAGE_SIZE_BOARD,
    searchField,
    searchQuery,
  });

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

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-4 py-10 sm:px-10">
      <BoardHeader
        title={config.title}
        descriptionHtml={config.description}
        canWrite={canWrite}
        writeHref={writeHref}
      />

      <section>
        {list.isEmpty ? (
          <BoardEmptyState searchQuery={searchQuery} />
        ) : (
          <>
            <BoardPostTable
              posts={list.posts}
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
              {list.totalPages > 1 && (
                <div className="flex justify-center">
                  <PaginationNav
                    currentPage={list.currentPage}
                    totalPages={list.totalPages}
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
