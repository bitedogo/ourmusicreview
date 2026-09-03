"use client";
/** 문의 페이지 — FAQ 탭 */

import { FaqPublicClient } from "@/src/components/faq/faq-public-client";
import type { FaqItemDto } from "@/src/lib/faq/client-api";

interface InquiryFaqPanelProps {
  faqs: FaqItemDto[];
}

export function InquiryFaqPanel({ faqs }: InquiryFaqPanelProps) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-8">
      <header className="mb-6 text-center sm:text-left">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
          자주 묻는 질문
        </h2>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          문의 전 아래 내용을 먼저 확인해 보세요.
        </p>
      </header>
      <FaqPublicClient faqs={faqs} />
    </section>
  );
}
