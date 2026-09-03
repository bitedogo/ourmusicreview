"use client";
/** ë¬¸ì˜ ?ì„¸Â·?µë? ?¤ë ˆ??*/

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
          setError(getApiErrorMessage(loadError, "ë¬¸ì˜ë¥?ë¶ˆëŸ¬?¤ì? ëª»í–ˆ?µë‹ˆ??"));
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
        ë¶ˆëŸ¬?¤ëŠ” ì¤?..
      </div>
    );
  }

  if (error || !inquiryData) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-red-500">{error ?? "ë¬¸ì˜ë¥?ì°¾ì„ ???†ìŠµ?ˆë‹¤."}</p>
        <Link href={inquiry()} className="mt-4 inline-block text-sm text-[var(--color-accent)] underline">
          ë¬¸ì˜ ëª©ë¡?¼ë¡œ
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
          ??1:1 ë¬¸ì˜ë¡??Œì•„ê°€ê¸?        </Link>

        <header className="mb-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-text-muted)]">
            <span className="font-mono">{inquiryData.publicCode}</span>
            <span>Â·</span>
            <span>{categoryLabel(inquiryData.category)}</span>
            <span>Â·</span>
            <span>{INQUIRY_STATUS_LABEL[inquiryData.status]}</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold text-[var(--color-text-primary)]">
            {inquiryData.title}
          </h1>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            ?‘ìˆ˜??{formatDateTime(inquiryData.createdAt)}
          </p>
        </header>

        <article className="mb-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="mb-2 text-xs font-semibold text-[var(--color-text-muted)]">??ë¬¸ì˜</p>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-text-primary)]">
            {inquiryData.body}
          </p>
          <InquiryAttachmentList files={inquiryData.attachments} />
        </article>

        <InquiryReplyThread replies={inquiryData.replies} />

        {inquiryData.status === "WAITING" && inquiryData.replies.length === 0 ? (
          <p className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-[var(--color-text-secondary)]">
            ?µë???ì¤€ë¹?ì¤‘ì…?ˆë‹¤. ?„ë£Œ?˜ë©´ ?´ë©”?¼ê³¼ ?œë™ ?Œë¦¼?¼ë¡œ ?ˆë‚´?œë¦½?ˆë‹¤.
          </p>
        ) : null}
      </div>
    </div>
  );
}

