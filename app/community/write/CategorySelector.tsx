"use client";
/** 커뮤니티 글쓰기 - 카테고리 선택 영역 */

import type { NoticeCategory } from "@/src/lib/community/types";
import {
  BOARD_CATEGORY_LABEL,
  USER_WRITE_CATEGORIES,
} from "@/src/lib/community/board-config";
import { NOTICE_CATEGORY_OPTIONS } from "@/src/lib/community/notice-category";
import type { PostCategory } from "@/src/lib/db/entities/Post";

export type WriteCategory = PostCategory;

interface CategorySelectorProps {
  category: WriteCategory;
  isCategoryLocked: boolean;
  noticeCategory: NoticeCategory;
  onCategoryChange: (category: WriteCategory) => void;
  onNoticeCategoryChange: (noticeCategory: NoticeCategory) => void;
}

const CATEGORY_BUTTON_COLORS: Partial<Record<WriteCategory, string>> = {
  K: "bg-blue-600 text-white border-blue-600",
  I: "bg-purple-600 text-white border-purple-600",
  M: "bg-emerald-600 text-white border-emerald-600",
  W: "bg-orange-600 text-white border-orange-600",
};

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
          {BOARD_CATEGORY_LABEL[category]}
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
        {USER_WRITE_CATEGORIES.map((key) => (
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
            {BOARD_CATEGORY_LABEL[key]}
          </button>
        ))}
      </div>
    </>
  );
}
