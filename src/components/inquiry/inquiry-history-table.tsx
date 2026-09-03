"use client";
/** 내 문의 내역 테이블 */

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { PaginationNav } from "@/src/components/common/PaginationNav";
import {
  fetchMyInquiries,
  type InquiryListItem,
} from "@/src/lib/inquiries/client-api";
import {
  categoryLabel,
  INQUIRY_STATUS_LABEL,
  type InquiryStatus,
} from "@/src/lib/inquiries/types";
import { getApiErrorMessage } from "@/src/lib/http/client";
import { inquiryDetail } from "@/src/lib/navigation/routes";
import { formatMonthDay } from "@/src/lib/utils/date";

interface InquiryHistoryTableProps {
  refreshKey?: number;
}

function StatusBadge({ status }: { status: InquiryStatus }) {
  const dotClass =
    status === "WAITING"
      ? "bg-[var(--color-accent)]"
      : status === "ANSWERED"
        ? "bg-zinc-500"
        : "bg-zinc-300";

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
      <span className={`h-2 w-2 rounded-full ${dotClass}`} aria-hidden />
      {INQUIRY_STATUS_LABEL[status]}
    </span>
  );
}

export function InquiryHistoryTable({ refreshKey = 0 }: InquiryHistoryTableProps) {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<InquiryListItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (nextPage: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchMyInquiries(nextPage);
      setItems(data.data.items);
      setTotalPages(data.data.totalPages);
      setPage(data.data.page);
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, "문의 내역을 불러오지 못했습니다."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(1);
  }, [load, refreshKey]);

  return (
    <section id="inquiry-history" className="scroll-mt-24">
      <header className="mb-4">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
          내 문의 내역
        </h2>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          접수된 문의와 답변 상태를 확인할 수 있습니다.
        </p>
      </header>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-zinc-100 bg-zinc-50/80 text-xs text-[var(--color-text-muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">티켓번호</th>
                <th className="px-4 py-3 font-medium">유형</th>
                <th className="px-4 py-3 font-medium">제목</th>
                <th className="px-4 py-3 font-medium">상태</th>
                <th className="px-4 py-3 font-medium">접수일</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-[var(--color-text-secondary)]">
                    불러오는 중...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-red-500">
                    {error}
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-[var(--color-text-secondary)]">
                    접수된 문의가 없습니다.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="border-b border-zinc-50 last:border-0">
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-[var(--color-text-muted)]">
                      <Link
                        href={inquiryDetail(item.id)}
                        className="hover:text-[var(--color-accent)] hover:underline"
                      >
                        {item.publicCode}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-[var(--color-text-secondary)]">
                      {categoryLabel(item.category)}
                    </td>
                    <td className="max-w-[14rem] truncate px-4 py-3">
                      <Link
                        href={inquiryDetail(item.id)}
                        className="font-medium text-[var(--color-text-primary)] hover:text-[var(--color-accent)] hover:underline"
                      >
                        {item.title}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-[var(--color-text-muted)]">
                      {formatMonthDay(item.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex justify-center">
        <PaginationNav
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(nextPage) => {
            void load(nextPage);
          }}
        />
      </div>
    </section>
  );
}
