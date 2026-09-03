"use client";
/** 문의 상세·답변 스레드 */

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  fetchInquiryDetail,
  type InquiryDetail,
} from "@/src/lib/inquiries/client-api";
import {
  categoryLabel,
  INQUIRY_STATUS_LABEL,
} from "@/src/lib/inquiries/types";
import { formatDateTime } from "@/src/lib/utils/date";
import { getApiErrorMessage } from "@/src/lib/http/client";
import { inquiry } from "@/src/lib/navigation/routes";
import { InquiryAttachmentList, InquiryReplyThread } from "./inquiry-shared";

interface InquiryDetailClientProps {
  inquiryId: string;
}

export function InquiryDetailClient({ inquiryId }: InquiryDetailClientProps) {
  const [inquiryData, setInquiryData] = useState<InquiryDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchInquiryDetail(inquiryId);
        if (!cancelled) setInquiryData(data.data.inquiry);
      } catch (loadError) {
        if (!cancelled) {
          setError(getApiErrorMessage(loadError, "문의를 불러오지 못했습니다."));
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [inquiryId]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-[var(--color-text-secondary)]">
        불러오는 중...
      </div>
    );
  }

  if (error || !inquiryData) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-red-500">{error ?? "문의를 찾을 수 없습니다."}</p>
        <Link href={inquiry()} className="mt-4 inline-block text-sm text-[var(--color-accent)] underline">
          문의 목록으로
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50/70">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-8">
        <Link
          href={inquiry()}
          className="mb-6 inline-flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent)]"
        >
          &larr; 1:1 문의로 돌아가기
        </Link>

        <header className="mb-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-text-muted)]">
            <span className="font-mono">{inquiryData.publicCode}</span>
            <span>&middot;</span>
            <span>{categoryLabel(inquiryData.category)}</span>
            <span>&middot;</span>
            <span>{INQUIRY_STATUS_LABEL[inquiryData.status]}</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold text-[var(--color-text-primary)]">
            {inquiryData.title}
          </h1>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            접수일 {formatDateTime(inquiryData.createdAt)}
          </p>
        </header>

        <article className="mb-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="mb-2 text-xs font-semibold text-[var(--color-text-muted)]">내 문의</p>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-text-primary)]">
            {inquiryData.body}
          </p>
          <InquiryAttachmentList files={inquiryData.attachments} />
        </article>

        <InquiryReplyThread replies={inquiryData.replies} />

        {inquiryData.status === "WAITING" && inquiryData.replies.length === 0 ? (
          <p className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-[var(--color-text-secondary)]">
            답변을 준비 중입니다. 완료되면 이메일과 활동 알림으로 안내드립니다.
          </p>
        ) : null}
      </div>
    </div>
  );
}
