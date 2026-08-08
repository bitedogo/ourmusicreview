"use client";
/** 관리자 회원 관리 - 탭/검색 필터 바 */

import type { MemberTabType } from "./types";

interface MemberFilterBarProps {
  activeTab: MemberTabType;
  onTabChange: (tab: MemberTabType) => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
}

const TABS: Array<{ key: MemberTabType; label: string }> = [
  { key: "all", label: "전체회원" },
  { key: "admin", label: "관리자" },
];

export function MemberFilterBar({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchQueryChange,
}: MemberFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-3">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onTabChange(tab.key)}
          className={`border-b-2 px-4 py-2 text-xs font-medium transition ${
            activeTab === tab.key
              ? "border-[var(--color-brand-primary)] text-[var(--color-brand-primary)]"
              : "border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          }`}
        >
          {tab.label}
        </button>
      ))}
      <input
        type="text"
        placeholder="검색..."
        value={searchQuery}
        onChange={(e) => onSearchQueryChange(e.target.value)}
        className="ml-auto w-32 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-brand-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-primary)] sm:w-40"
      />
    </div>
  );
}
