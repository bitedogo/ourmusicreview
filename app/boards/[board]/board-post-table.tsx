/** 게시판 글 목록 테이블 */

import Link from "next/link";
import type { NoticeCategory } from "@/src/lib/community/types";
import {
  NOTICE_CATEGORY_COLOR,
  NOTICE_CATEGORY_LABEL,
} from "@/src/lib/community/notice-category";

export interface BoardPostRow {
  id: string;
  title: string;
  nickname: string;
  createdAt: Date;
  commentCount: number;
  isPinned: boolean;
  isReleasePinned: boolean;
  noticeCategory?: NoticeCategory | null;
  /** 표시할 순번. 고정/공지 게시글은 null이며 대신 아이콘이 표시됩니다. */
  rowNumber: number | null;
}

interface BoardPostTableProps {
  posts: BoardPostRow[];
  isNoticeBoard: boolean;
}

function getNoticeCategoryLabel(post: {
  noticeCategory?: NoticeCategory | null;
}): string | null {
  if (!post.noticeCategory || !(post.noticeCategory in NOTICE_CATEGORY_LABEL))
    return null;
  return NOTICE_CATEGORY_LABEL[post.noticeCategory as NoticeCategory];
}

function getNoticeCategoryColor(post: {
  noticeCategory?: NoticeCategory | null;
}): string | null {
  if (!post.noticeCategory || !(post.noticeCategory in NOTICE_CATEGORY_COLOR))
    return null;
  return NOTICE_CATEGORY_COLOR[post.noticeCategory as NoticeCategory];
}

export function BoardPostTable({ posts, isNoticeBoard }: BoardPostTableProps) {
  return (
    <div className="overflow-hidden border border-zinc-200 bg-white text-xs shadow-sm">
      <table className="min-w-full table-fixed border-collapse">
        <thead className="bg-zinc-50">
          <tr className="border-b border-zinc-200 text-[var(--color-text-primary)]">
            <th className="w-[60px] px-3 py-2 text-center font-semibold">
              번호
            </th>
            <th className="px-3 py-2 text-left font-semibold">제목</th>
            <th className="w-[100px] px-3 py-2 text-center font-semibold">
              글쓴이
            </th>
            <th className="w-[80px] px-3 py-2 text-center font-semibold">
              날짜
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {posts.map((post) => (
            <tr
              key={post.id}
              className={`hover:bg-zinc-50 ${post.isPinned ? "bg-zinc-50/50" : ""}`}
            >
              <td className="px-3 py-2 text-center text-[11px] text-[var(--color-text-muted)]">
                {post.isPinned || post.isReleasePinned || isNoticeBoard ? (
                  <span
                    className="inline-flex items-center justify-center"
                    title={
                      post.isReleasePinned && !post.isPinned && !isNoticeBoard
                        ? "릴리즈"
                        : "공지사항"
                    }
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`h-4 w-4 ${
                        post.isReleasePinned && !post.isPinned && !isNoticeBoard
                          ? "text-emerald-600"
                          : "text-red-600"
                      }`}
                    >
                      <path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1z" />
                      <path d="M14.5 8.5a5 5 0 0 1 0 7" />
                      <path d="M17.5 6a8.5 8.5 0 0 1 0 12" />
                    </svg>
                  </span>
                ) : (
                  post.rowNumber
                )}
              </td>
              <td className="px-3 py-2 text-sm">
                <Link
                  href={`/community/${encodeURIComponent(post.id)}`}
                  className={`flex items-center gap-1.5 hover:underline ${isNoticeBoard ? "font-bold text-[var(--color-text-primary)]" : ""} ${post.isPinned ? "text-red-600 font-bold" : ""} ${post.isReleasePinned && !post.isPinned ? "text-emerald-600 font-bold" : ""}`}
                >
                  {isNoticeBoard &&
                    (() => {
                      const label = getNoticeCategoryLabel(post);
                      const color = getNoticeCategoryColor(post);
                      return label && color ? (
                        <span className={`shrink-0 font-semibold ${color}`}>
                          [{label}]
                        </span>
                      ) : null;
                    })()}
                  <span
                    className={`line-clamp-1 ${isNoticeBoard ? "font-bold text-[var(--color-text-primary)]" : ""}`}
                  >
                    {post.title}
                  </span>
                  {post.commentCount > 0 && (
                    <span className="text-[10px] font-bold text-red-500">
                      [{post.commentCount}]
                    </span>
                  )}
                </Link>
              </td>
              <td className="px-3 py-2 text-center text-[11px] text-[var(--color-text-primary)]">
                <span
                  className={`line-clamp-1 ${post.isPinned ? "font-black" : ""}`}
                >
                  {post.nickname}
                </span>
              </td>
              <td className="px-3 py-2 text-center text-[11px] text-[var(--color-text-secondary)]">
                {post.createdAt
                  ? new Date(post.createdAt).toLocaleDateString("ko-KR", {
                      month: "2-digit",
                      day: "2-digit",
                    })
                  : ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
