"use client";
/** 커뮤니티 글쓰기 - 카테고리 선택 영역 */

import type { NoticeCategory } from "@/src/lib/community/types";
import { NOTICE_CATEGORY_OPTIONS } from "@/src/lib/community/notice-category";

export type WriteCategory = "K" | "I" | "M" | "W" | "N";

interface CategorySelectorProps {
  category: WriteCategory;
  isCategoryLocked: boolean;
  noticeCategory: NoticeCategory;
  onCategoryChange: (category: WriteCategory) => void;
  onNoticeCategoryChange: (noticeCategory: NoticeCategory) => void;
}

const CATEGORY_LABELS: Record<WriteCategory, string> = {
  K: "국내게시판",
  I: "해외게시판",
  M: "장터게시판",
  W: "워크룸",
  N: "공지사항",
};

const CATEGORY_BUTTON_COLORS: Partial<Record<WriteCategory, string>> = {
  K: "bg-blue-600 text-white border-blue-600",
  I: "bg-purple-600 text-white border-purple-600",
  M: "bg-emerald-600 text-white border-emerald-600",
  W: "bg-orange-600 text-white border-orange-600",
};

const SELECTABLE_CATEGORIES: WriteCategory[] = ["K", "I", "M", "W"];

export function CategorySelector({
  category,
  isCategoryLocked,
  noticeCategory,
  onCategoryChange,
  onNoticeCategoryChange,
}: CategorySelectorProps) {
  if (isCategoryLocked) {
    return (
      <div
        className={
          category === "N"
            ? "flex flex-wrap items-center justify-between gap-3"
            : ""
        }
      >
        <p className="text-lg font-semibold text-[var(--color-text-primary)]">
          {CATEGORY_LABELS[category]}
        </p>
        {category === "N" && (
          <div className="inline-flex flex-wrap justify-end gap-1 text-xs text-[var(--color-text-secondary)]">
            {NOTICE_CATEGORY_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => onNoticeCategoryChange(value)}
                className={[
                  "rounded-full px-3 py-1.5 font-semibold border",
                  noticeCategory === value
                    ? "bg-[var(--color-brand-primary)] text-white border-[var(--color-brand-primary)]"
                    : "border-zinc-200 text-[var(--color-text-secondary)] hover:text-[var(--color-brand-primary)]",
                ].join(" ")}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <label className="text-xs font-medium text-[var(--color-text-secondary)]">카테고리</label>
      <div className="inline-flex flex-wrap gap-1 text-xs text-[var(--color-text-secondary)]">
        {SELECTABLE_CATEGORIES.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => onCategoryChange(key)}
            className={[
              "rounded-full px-3 py-1.5 font-semibold border",
              category === key
                ? CATEGORY_BUTTON_COLORS[key]
                : "border-zinc-200 text-[var(--color-text-secondary)] hover:text-[var(--color-brand-primary)]",
            ].join(" ")}
          >
            {CATEGORY_LABELS[key]}
          </button>
        ))}
      </div>
    </>
  );
}
