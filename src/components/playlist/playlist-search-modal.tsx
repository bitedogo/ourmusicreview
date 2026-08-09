"use client";
/** 공개 플레이리스트 검색 모달 */

import type { PlaylistSearchField } from "@/src/hooks/use-public-playlist-list";

export const PLAYLIST_SEARCH_FIELD_OPTIONS: {
  value: PlaylistSearchField;
  label: string;
}[] = [
  { value: "title", label: "플레이리스트명" },
  { value: "author", label: "작성자명" },
];

interface PlaylistSearchModalProps {
  searchField: PlaylistSearchField;
  searchQuery: string;
  onSearchFieldChange: (field: PlaylistSearchField) => void;
  onSearchQueryChange: (query: string) => void;
  onSubmit: (event: React.FormEvent) => void;
  onClose: () => void;
}

export function PlaylistSearchModal({
  searchField,
  searchQuery,
  onSearchFieldChange,
  onSearchQueryChange,
  onSubmit,
  onClose,
}: PlaylistSearchModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
          플레이리스트 검색
        </h2>
        <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
          검색 기준을 선택하고 키워드를 입력해주세요.
        </p>

        <form onSubmit={onSubmit} className="mt-4 space-y-4">
          <div className="flex gap-2">
            {PLAYLIST_SEARCH_FIELD_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onSearchFieldChange(option.value)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
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
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.target.value)}
            placeholder="검색어를 입력하세요"
            className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs text-[var(--color-text-primary)] hover:bg-zinc-50"
            >
              취소
            </button>
            <button
              type="submit"
              className="rounded-full bg-[var(--color-brand-primary)] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[var(--color-brand-primary-hover)]"
            >
              검색
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
