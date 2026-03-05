"use client";

import { useEffect, useState } from "react";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

const INITIAL_COUNT = 5;
const LOAD_MORE_COUNT = 5;

export default function FaqPage() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchFaqs() {
      try {
        const response = await fetch("/api/faq", { signal: controller.signal });
        const data = await response.json();
        if (data?.ok && Array.isArray(data?.faqs)) {
          setFaqs(data.faqs);
          if (data.faqs.length > 0) {
            setExpandedId(data.faqs[0].id);
          }
        }
      } catch {
        if (controller.signal.aborted) return;
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }
    fetchFaqs();

    return () => {
      controller.abort();
    };
  }, []);

  const visibleFaqs = faqs.slice(0, visibleCount);
  const hasMore = visibleCount < faqs.length;

  function loadMore() {
    setVisibleCount((prev) => Math.min(prev + LOAD_MORE_COUNT, faqs.length));
  }

  if (isLoading) {
    return (
      <div className="mx-auto min-h-screen max-w-4xl px-6 py-16 sm:px-10">
        <div className="py-12 text-center text-sm text-zinc-500">
          FAQ를 불러오는 중...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50/70">
      <div className="mx-auto max-w-4xl px-6 py-16 sm:px-10">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900">
            자주 묻는 질문
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Frequently asked questions
          </p>
        </header>

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
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-zinc-50"
              >
                <span className="flex-1 text-base font-medium text-zinc-900">
                  {faq.question}
                </span>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-zinc-950 text-white">
                  {isExpanded ? "−" : "+"}
                </span>
              </button>
              {isExpanded && (
                <div className="border-t border-zinc-100 px-5 pb-5 pt-4">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-500">
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
            className="rounded-full bg-zinc-900 px-8 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
          >
            더 보기
          </button>
        </div>
      )}

      {faqs.length === 0 && !isLoading && (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-12 text-center text-sm text-zinc-500">
          등록된 FAQ가 없습니다.
        </div>
      )}
      </div>
    </div>
  );
}
