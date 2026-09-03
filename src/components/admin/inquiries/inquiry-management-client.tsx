"use client";
/** 관리자 1:1 문의 관리 */

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { PaginationNav } from "@/src/components/common/PaginationNav";
import { getApiErrorMessage } from "@/src/lib/http/client";
import {
  closeAdminInquiry,
  fetchAdminInquiries,
  fetchAdminInquiryDetail,
  replyAdminInquiry,
  type AdminInquiryDetail,
  type AdminInquiryListItem,
} from "@/src/lib/inquiries/admin-client-api";
import {
  categoryLabel,
  INQUIRY_BODY_MAX,
  INQUIRY_STATUS_LABEL,
  type InquiryStatus,
} from "@/src/lib/inquiries/types";
import { formatDateTime } from "@/src/lib/utils/date";
import {
  InquiryAttachmentList,
  InquiryReplyThread,
} from "@/src/components/inquiry/inquiry-shared";
import { inquiryDetail } from "@/src/lib/navigation/routes";

type StatusFilter = "ALL" | InquiryStatus;

const STATUS_TABS: { id: StatusFilter; label: string }[] = [
  { id: "ALL", label: "전체" },
  { id: "WAITING", label: "답변대기" },
  { id: "ANSWERED", label: "답변완료" },
  { id: "CLOSED", label: "종료" },
];

function StatusBadge({ status }: { status: InquiryStatus }) {
  const className =
    status === "WAITING"
      ? "bg-[var(--color-inquiry-bg)] text-[var(--color-inquiry-text-dark)]"
      : status === "ANSWERED"
        ? "bg-zinc-100 text-zinc-600"
        : "bg-zinc-50 text-[var(--color-text-muted)]";

  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${className}`}>
      {INQUIRY_STATUS_LABEL[status]}
    </span>
  );
}

export function InquiryManagementClient() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("WAITING");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<AdminInquiryListItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminInquiryDetail | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);

  const loadList = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAdminInquiries(
        page,
        statusFilter === "ALL" ? undefined : statusFilter
      );
      setItems(data.data.items);
      setTotalPages(data.data.totalPages);
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, "문의 목록을 불러오지 못했습니다."));
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter]);

  const loadDetail = useCallback(async (id: string) => {
    setIsLoadingDetail(true);
    setDetailError(null);
    try {
      const data = await fetchAdminInquiryDetail(id);
      setDetail(data.data.inquiry);
    } catch (loadError) {
      setDetail(null);
      setDetailError(getApiErrorMessage(loadError, "문의를 불러오지 못했습니다."));
    } finally {
      setIsLoadingDetail(false);
    }
  }, []);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  useEffect(() => {
    setPage(1);
    setSelectedId(null);
    setDetail(null);
  }, [statusFilter]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    void loadDetail(selectedId);
  }, [selectedId, loadDetail]);

  async function handleReply(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedId || !replyBody.trim()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await replyAdminInquiry(selectedId, replyBody.trim());
      setReplyBody("");
      await Promise.all([loadDetail(selectedId), loadList()]);
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, "답변 등록에 실패했습니다."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleClose() {
    if (!selectedId || !detail) return;
    if (!confirm("이 문의를 종료하시겠습니까? 종료 후에는 답변을 등록할 수 없습니다.")) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await closeAdminInquiry(selectedId);
      await Promise.all([loadDetail(selectedId), loadList()]);
    } catch (closeError) {
      setError(getApiErrorMessage(closeError, "문의 종료에 실패했습니다."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-6 py-10 sm:px-16">
      <section>
        <h1 className="text-xl font-semibold tracking-tight">1:1 문의 관리</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          접수된 문의를 확인하고 답변·종료 처리합니다.
        </p>
      </section>

      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setStatusFilter(tab.id)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              statusFilter === tab.id
                ? "bg-[var(--color-brand-primary)] text-white"
                : "border border-zinc-200 bg-white text-[var(--color-text-secondary)] hover:bg-zinc-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        {/* 목록 */}
        <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          {isLoading ? (
            <p className="px-4 py-10 text-center text-sm text-[var(--color-text-secondary)]">
              불러오는 중...
            </p>
          ) : items.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-[var(--color-text-secondary)]">
              해당 상태의 문의가 없습니다.
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-xs">
                  <thead className="border-b border-zinc-100 bg-zinc-50 text-[11px] text-[var(--color-text-muted)]">
                    <tr>
                      <th className="px-3 py-2 font-medium">티켓</th>
                      <th className="px-3 py-2 font-medium">회원</th>
                      <th className="px-3 py-2 font-medium">제목</th>
                      <th className="px-3 py-2 font-medium">상태</th>
                      <th className="px-3 py-2 font-medium">접수일</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedId(item.id)}
                        className={`cursor-pointer border-b border-zinc-50 transition hover:bg-zinc-50 ${
                          selectedId === item.id ? "bg-[var(--color-inquiry-bg)]/70" : ""
                        }`}
                      >
                        <td className="whitespace-nowrap px-3 py-2 font-mono text-[11px]">
                          {item.publicCode}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2">
                          {item.userNickname}
                        </td>
                        <td className="max-w-[12rem] truncate px-3 py-2 font-medium">
                          {item.title}
                        </td>
                        <td className="whitespace-nowrap px-3 py-2">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="whitespace-nowrap px-3 py-2 text-[11px] text-[var(--color-text-muted)]">
                          {formatDateTime(item.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-center py-3">
                <PaginationNav
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            </>
          )}
        </section>

        {/* 상세 패널 */}
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          {!selectedId ? (
            <p className="py-16 text-center text-sm text-[var(--color-text-secondary)]">
              왼쪽 목록에서 문의를 선택하세요.
            </p>
          ) : isLoadingDetail ? (
            <p className="py-16 text-center text-sm text-[var(--color-text-secondary)]">
              불러오는 중...
            </p>
          ) : detailError || !detail ? (
            <p className="py-16 text-center text-sm text-red-500">
              {detailError ?? "문의를 불러오지 못했습니다."}
            </p>
          ) : (
            <div className="space-y-5">
              <header className="space-y-2 border-b border-zinc-100 pb-4">
                <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-text-muted)]">
                  <span className="font-mono">{detail.publicCode}</span>
                  <span>·</span>
                  <span>{categoryLabel(detail.category)}</span>
                  <StatusBadge status={detail.status} />
                </div>
                <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
                  {detail.title}
                </h2>
                <p className="text-xs text-[var(--color-text-secondary)]">
                  {detail.userNickname} · {detail.email}
                  {detail.contact ? ` · ${detail.contact}` : ""}
                </p>
                <p className="text-[11px] text-[var(--color-text-muted)]">
                  접수 {formatDateTime(detail.createdAt)}
                </p>
                <Link
                  href={inquiryDetail(detail.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-xs text-[var(--color-accent)] underline"
                >
                  사용자 화면에서 보기
                </Link>
              </header>

              <article className="rounded-xl bg-zinc-50 px-4 py-3">
                <p className="mb-1 text-xs font-semibold text-[var(--color-text-muted)]">
                  문의 내용
                </p>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-text-primary)]">
                  {detail.body}
                </p>
                <InquiryAttachmentList files={detail.attachments} />
              </article>

              <InquiryReplyThread replies={detail.replies} />

              {detail.status !== "CLOSED" ? (
                <form onSubmit={(event) => void handleReply(event)} className="space-y-3 border-t border-zinc-100 pt-4">
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-medium text-[var(--color-text-secondary)]">
                      답변 작성
                    </span>
                    <textarea
                      value={replyBody}
                      onChange={(event) => setReplyBody(event.target.value)}
                      className="min-h-[8rem] w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
                      placeholder="답변 내용을 입력하세요."
                      maxLength={INQUIRY_BODY_MAX}
                    />
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="submit"
                      disabled={isSubmitting || !replyBody.trim()}
                      className="rounded-full bg-[var(--color-brand-primary)] px-5 py-2 text-xs font-semibold text-white disabled:opacity-60"
                    >
                      {isSubmitting ? "등록 중..." : "답변 등록"}
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleClose()}
                      disabled={isSubmitting}
                      className="rounded-full border border-zinc-300 bg-white px-5 py-2 text-xs font-semibold text-[var(--color-text-primary)] disabled:opacity-60"
                    >
                      문의 종료
                    </button>
                  </div>
                </form>
              ) : (
                <p className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-[var(--color-text-secondary)]">
                  종료된 문의입니다.
                </p>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
