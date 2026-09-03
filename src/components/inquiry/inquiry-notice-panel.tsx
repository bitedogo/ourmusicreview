"use client";
/** 문의 페이지 — 공지사항 탭 */

import { BoardPostTable } from "@/app/boards/[board]/board-post-table";
import { PaginationNav } from "@/src/components/common/PaginationNav";
import type { NoticeCategory } from "@/src/lib/community/types";
import { inquiry } from "@/src/lib/navigation/routes";

export interface InquiryNoticePost {
  id: string;
  title: string;
  nickname: string;
  createdAt: string;
  commentCount: number;
  isPinned: boolean;
  isReleasePinned: boolean;
  noticeCategory: NoticeCategory | null;
  rowNumber: number | null;
}

interface InquiryNoticePanelProps {
  posts: InquiryNoticePost[];
  currentPage: number;
  totalPages: number;
}

export function InquiryNoticePanel({
  posts,
  currentPage,
  totalPages,
}: InquiryNoticePanelProps) {
  function buildHref(page: number) {
    const params = new URLSearchParams({ tab: "notice" });
    if (page > 1) params.set("page", String(page));
    return `${inquiry()}?${params.toString()}`;
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-8">
      <header className="mb-6">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
          공지사항
        </h2>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          ORU 서비스 관련 공지를 확인할 수 있습니다.
        </p>
      </header>

      {posts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-12 text-center text-sm text-[var(--color-text-secondary)]">
          등록된 공지가 없습니다.
        </div>
      ) : (
        <>
          <BoardPostTable
            posts={posts.map((post) => ({
              ...post,
              createdAt: new Date(post.createdAt),
            }))}
            isNoticeBoard
          />
          <div className="mt-4 flex justify-center">
            <PaginationNav
              currentPage={currentPage}
              totalPages={totalPages}
              buildHref={buildHref}
            />
          </div>
        </>
      )}
    </section>
  );
}
