"use client";
/** 1:1 문의 페이지 클라이언트 */

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import type { FaqItemDto } from "@/src/lib/faq/client-api";
import { InquiryFaqPanel } from "./inquiry-faq-panel";
import { InquiryForm } from "./inquiry-form";
import { InquiryHistoryTable } from "./inquiry-history-table";
import {
  InquiryNoticePanel,
  type InquiryNoticePost,
} from "./inquiry-notice-panel";

type InquiryTab = "write" | "history" | "faq" | "notice";

const TABS: { id: InquiryTab; label: string }[] = [
  { id: "write", label: "문의하기" },
  { id: "history", label: "내 문의 내역" },
  { id: "faq", label: "자주 묻는 질문" },
  { id: "notice", label: "공지사항" },
];

function parseTab(value: string | null): InquiryTab {
  if (value === "history" || value === "faq" || value === "notice") return value;
  return "write";
}

interface InquiryPageClientProps {
  defaultEmail: string;
  faqs: FaqItemDto[];
  noticePosts: InquiryNoticePost[];
  noticePage: number;
  noticeTotalPages: number;
  initialTab: InquiryTab;
}

export function InquiryPageClient({
  defaultEmail,
  faqs,
  noticePosts,
  noticePage,
  noticeTotalPages,
  initialTab,
}: InquiryPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = parseTab(searchParams.get("tab"));
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const selectTab = useCallback(
    (tab: InquiryTab) => {
      setSuccessMessage(null);
      const params = new URLSearchParams();
      if (tab !== "write") params.set("tab", tab);
      if (tab === "notice" && noticePage > 1) {
        params.set("page", String(noticePage));
      }
      const query = params.toString();
      router.replace(query ? `/inquiry?${query}` : "/inquiry", { scroll: false });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [noticePage, router]
  );

  function handleSubmitted() {
    setSuccessMessage(
      "문의가 접수되었습니다. 답변은 이메일과 내 문의 내역에서 확인할 수 있습니다."
    );
    setHistoryRefreshKey((value) => value + 1);
    selectTab("history");
  }

  const tabClass = (tab: InquiryTab) =>
    `px-4 py-3 text-sm font-medium transition ${
      activeTab === tab
        ? "border-b-2 border-[var(--color-accent)] text-[var(--color-text-primary)]"
        : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
    }`;

  return (
    <div className="min-h-screen bg-zinc-50/70">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-8 sm:py-16">
        <header className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">
            Support
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--color-text-primary)] sm:text-4xl">
            1:1 문의하기
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[var(--color-text-secondary)]">
            서비스 이용 중 궁금한 점이나 불편한 점을 남겨 주세요.
            <br className="hidden sm:block" />
            영업일 기준 1~2일 내 순차적으로 답변드립니다.
          </p>
        </header>

        <nav
          aria-label="문의 섹션"
          className="mb-8 flex flex-wrap items-center justify-center gap-1 border-b border-zinc-200"
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => selectTab(tab.id)}
              className={tabClass(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {successMessage && activeTab === "history" ? (
          <div className="mb-6 rounded-xl border border-[var(--color-inquiry-border)] bg-[var(--color-inquiry-bg)] px-4 py-3 text-sm text-[var(--color-inquiry-text-dark)]">
            {successMessage}
          </div>
        ) : null}

        {activeTab === "write" ? (
          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-8">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
                새 문의 작성
              </h2>
              <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                유형을 선택하고 내용을 작성해 주세요.
              </p>
            </div>
            <InquiryForm
              defaultEmail={defaultEmail}
              onSubmitted={handleSubmitted}
              onOpenFaq={() => selectTab("faq")}
            />
          </section>
        ) : null}

        {activeTab === "history" ? (
          <InquiryHistoryTable refreshKey={historyRefreshKey} />
        ) : null}

        {activeTab === "faq" ? <InquiryFaqPanel faqs={faqs} /> : null}

        {activeTab === "notice" ? (
          <InquiryNoticePanel
            posts={noticePosts}
            currentPage={noticePage}
            totalPages={noticeTotalPages}
          />
        ) : null}
      </div>
    </div>
  );
}
