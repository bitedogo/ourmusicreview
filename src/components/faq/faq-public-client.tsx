"use client";
/** FAQ 공개 아코디언·더보기 UI */

import { useState } from "react";
import type { FaqItemDto } from "@/src/lib/faq/client-api";

const INITIAL_COUNT = 5;
const LOAD_MORE_COUNT = 5;

interface FaqPublicClientProps {
  faqs: FaqItemDto[];
}

export function FaqPublicClient({ faqs }: FaqPublicClientProps) {
  const [expandedId, setExpandedId] = useState<string | null>(
    faqs[0]?.id ?? null
  );
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);

  const visibleFaqs = faqs.slice(0, visibleCount);
  const hasMore = visibleCount < faqs.length;

  function loadMore() {
    setVisibleCount((prev) => Math.min(prev + LOAD_MORE_COUNT, faqs.length));
  }

  return (
    <>
      <div className="space-y-3">
        {visibleFaqs.map((faq) => {
          const isExpanded = expandedId === faq.id;
          return (
            <div
              key={faq.id}
              className="overflow-hidden rounded-2xl border border-zinc-200 bg-white"
            >
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                className="group flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="flex-1 text-base font-medium text-[var(--color-text-primary)] transition-colors group-hover:text-[var(--color-brand-primary)]">
                  {faq.question}
                </span>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[var(--color-brand-primary)] text-white transition-colors group-hover:bg-[var(--color-brand-primary-hover)]">
                  {isExpanded ? "−" : "+"}
                </span>
              </button>
              {isExpanded && (
                <div className="border-t border-zinc-100 px-5 pb-5 pt-4">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-text-secondary)]">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {hasMore && (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            className="rounded-full bg-[var(--color-brand-primary)] px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--color-brand-primary-hover)]"
          >
            더 보기
          </button>
        </div>
      )}

      {faqs.length === 0 && (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-12 text-center text-sm text-[var(--color-text-secondary)]">
          등록된 FAQ가 없습니다.
        </div>
      )}
    </>
  );
}
