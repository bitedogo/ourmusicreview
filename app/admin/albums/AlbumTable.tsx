"use client";
/** 관리자 오늘의 앨범 관리 - 목록 테이블 */

import { PaginationNav } from "@/src/components/common/PaginationNav";
import type { TodayAlbumItem } from "./types";

interface AlbumTableProps {
  albums: TodayAlbumItem[];
  processingIds: Set<string>;
  isPastDate: (displayDate: string) => boolean;
  onEdit: (item: TodayAlbumItem) => void;
  onDelete: (displayDate: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function AlbumTable({
  albums,
  processingIds,
  isPastDate,
  onEdit,
  onDelete,
  currentPage,
  totalPages,
  onPageChange,
}: AlbumTableProps) {
  return (
    <div className="overflow-hidden bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-xs">
          <thead>
            <tr className="bg-zinc-50 text-[11px] font-semibold text-zinc-500">
              <th className="px-3 py-2 text-left">날짜</th>
              <th className="px-3 py-2 text-left">제목</th>
              <th className="px-3 py-2 text-left">아티스트</th>
              <th className="px-3 py-2 text-left">처리</th>
            </tr>
          </thead>
          <tbody>
            {albums.map((item) => (
              <tr key={item.displayDate} className="hover:bg-zinc-50">
                <td className="px-3 py-2 align-middle">
                  <span className="text-xs font-medium text-zinc-900">
                    {item.displayDate}
                  </span>
                </td>
                <td className="max-w-[220px] px-3 py-2 align-middle">
                  <span className="truncate text-xs font-semibold text-zinc-900">
                    {item.title}
                  </span>
                </td>
                <td className="px-3 py-2 align-middle">
                  <span className="text-xs text-zinc-700">{item.artist}</span>
                </td>
                <td className="px-3 py-2 text-left align-middle">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(item)}
                      disabled={processingIds.has(item.displayDate) || isPastDate(item.displayDate)}
                      className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-[11px] font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(item.displayDate)}
                      disabled={processingIds.has(item.displayDate) || isPastDate(item.displayDate)}
                      className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-[11px] font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      삭제
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center border-t border-zinc-200 bg-zinc-50 px-4 py-3">
          <PaginationNav
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}
