"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type BoardSearchField = "title" | "author";

interface BoardSearchControlsProps {
  board: string;
  initialSearchField: BoardSearchField;
  initialQuery: string;
}

const SEARCH_FIELD_OPTIONS: Array<{ value: BoardSearchField; label: string }> = [
  { value: "title", label: "제목" },
  { value: "author", label: "작성자명" },
];

export function BoardSearchControls({
  board,
  initialSearchField,
  initialQuery,
}: BoardSearchControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchField, setSearchField] = useState<BoardSearchField>(initialSearchField);
  const [query, setQuery] = useState(initialQuery);

  function buildHref(nextField: BoardSearchField, nextQuery: string): string {
    const params = new URLSearchParams();
    params.set("page", "1");
    const trimmed = nextQuery.trim();
    if (trimmed) {
      params.set("searchField", nextField);
      params.set("q", trimmed);
    }
    return `/boards/${board}?${params.toString()}`;
  }

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push(buildHref(searchField, query));
    setIsModalOpen(false);
  }

  function handleResetSearch() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("searchField");
    params.delete("q");
    params.set("page", "1");
    router.push(`/boards/${board}?${params.toString()}`);
    setIsModalOpen(false);
  }

  return (
    <div className="flex items-center gap-2">
      {!!initialQuery && (
        <button
          type="button"
          onClick={handleResetSearch}
          className="hidden rounded-full border border-zinc-300 px-2.5 py-1 text-[11px] text-[var(--color-text-secondary)] hover:bg-zinc-100 sm:inline"
        >
          검색 해제
        </button>
      )}
      <button
        type="button"
        onClick={() => {
          setSearchField(initialSearchField);
          setQuery(initialQuery);
          setIsModalOpen(true);
        }}
        className="rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-[var(--color-text-primary)] transition hover:bg-zinc-100"
      >
        검색
      </button>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">게시글 검색</h2>
            <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
              검색 기준을 선택하고 키워드를 입력해주세요.
            </p>

            <form onSubmit={handleSearchSubmit} className="mt-4 space-y-4">
              <div className="flex gap-2">
                {SEARCH_FIELD_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSearchField(option.value)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                      searchField === option.value
                        ? "bg-[var(--color-brand-primary)] text-white"
                        : "bg-zinc-100 text-[var(--color-text-primary)] hover:bg-zinc-200"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="검색어를 입력하세요"
                className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-zinc-300 px-3 py-2 text-xs font-medium text-[var(--color-text-primary)] hover:bg-zinc-100"
                >
                  닫기
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[var(--color-brand-primary)] px-3 py-2 text-xs font-medium text-white hover:bg-[var(--color-brand-primary-hover)]"
                >
                  검색
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
