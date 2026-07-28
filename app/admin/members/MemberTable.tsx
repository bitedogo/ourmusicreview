"use client";
/** 관리자 회원 관리 - 목록 테이블 */

import Image from "next/image";
import { PaginationNav } from "@/src/components/common/PaginationNav";
import { formatMemberDate, type Member, type MemberSortColumn } from "./types";

interface MemberTableProps {
  members: Member[];
  currentUserId: string | undefined;
  selectedId: string | null;
  onSelect: (id: string) => void;
  sortColumn: MemberSortColumn;
  sortDirection: "asc" | "desc";
  onSortChange: (column: MemberSortColumn) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const COLUMN_LABELS: Record<MemberSortColumn, string> = {
  nickname: "닉네임",
  role: "역할",
  createdAt: "가입일",
  email: "이메일",
};

const COLUMNS: MemberSortColumn[] = ["nickname", "role", "createdAt", "email"];

export function MemberTable({
  members,
  currentUserId,
  selectedId,
  onSelect,
  sortColumn,
  sortDirection,
  onSortChange,
  currentPage,
  totalPages,
  onPageChange,
}: MemberTableProps) {
  return (
    <div className="overflow-hidden bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 text-[11px] font-semibold text-zinc-500">
              {COLUMNS.map((col) => {
                const isActive = sortColumn === col;
                const isCreatedAt = col === "createdAt";
                return (
                  <th
                    key={col}
                    scope="col"
                    onClick={() => onSortChange(col)}
                    className={`cursor-pointer select-none whitespace-nowrap px-4 py-3 transition hover:bg-zinc-100 ${isActive ? "text-[var(--color-brand-primary)]" : ""} ${isCreatedAt ? "hidden sm:table-cell" : ""}`}
                  >
                    <span className="inline-flex items-center gap-1">
                      {COLUMN_LABELS[col]}
                      {isActive && (
                        <span className="text-[10px]" aria-hidden>
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {members.map((member, idx) => {
              const isSelected = selectedId === member.id;
              const isCurrentUser = member.id === currentUserId;
              return (
                <tr
                  key={member.id}
                  onClick={() => onSelect(member.id)}
                  className={`cursor-pointer border-b border-zinc-100 transition-colors ${
                    isSelected
                      ? "bg-[var(--color-brand-primary)] text-white hover:bg-[var(--color-brand-primary-hover)]"
                      : idx % 2 === 1
                        ? "bg-zinc-50/50 hover:bg-zinc-100"
                        : "bg-white hover:bg-zinc-50"
                  }`}
                >
                  <td className="min-w-0 whitespace-nowrap px-4 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      {member.profileImage ? (
                        <Image
                          src={member.profileImage}
                          alt={member.nickname}
                          width={32}
                          height={32}
                          sizes="32px"
                          className="h-8 w-8 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                            isSelected
                              ? "bg-white/20 text-white"
                              : "bg-zinc-200 text-zinc-600"
                          }`}
                        >
                          {member.nickname?.charAt(0)?.toUpperCase() ?? "?"}
                        </div>
                      )}
                      <div className="min-w-0">
                        <span className="truncate font-medium">
                          {member.nickname}
                          {isCurrentUser && (
                            <span
                              className={
                                isSelected ? "text-white/80" : "text-zinc-400"
                              }
                            >
                              {" "}
                              (나)
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    {member.role === "ADMIN" ? "관리자" : "일반"}
                  </td>
                  <td className="hidden whitespace-nowrap px-4 py-3 text-zinc-500 sm:table-cell">
                    {formatMemberDate(member.createdAt)}
                  </td>
                  <td className="max-w-[120px] truncate whitespace-nowrap px-4 py-3 text-zinc-500 sm:max-w-[180px]">
                    {member.email}
                  </td>
                </tr>
              );
            })}
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
