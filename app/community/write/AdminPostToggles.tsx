"use client";
/** 커뮤니티 글쓰기 - 관리자 전용 토글 (전체 공지 / 릴리즈) */

import type { WriteCategory } from "./CategorySelector";

interface AdminPostTogglesProps {
  category: WriteCategory;
  isGlobal: boolean;
  isRelease: boolean;
  onIsGlobalChange: (value: boolean) => void;
  onIsReleaseChange: (value: boolean) => void;
}

export function AdminPostToggles({
  category,
  isGlobal,
  isRelease,
  onIsGlobalChange,
  onIsReleaseChange,
}: AdminPostTogglesProps) {
  return (
    <div className="flex shrink-0 items-center gap-3">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={isGlobal}
          onChange={(e) => {
            const isChecked = e.target.checked;
            onIsGlobalChange(isChecked);
            if (isChecked) {
              onIsReleaseChange(false);
            }
          }}
          className="h-4 w-4 rounded border-zinc-300 text-[var(--color-text-primary)] focus:ring-black"
        />
        <span className="text-xs font-bold text-red-600">전체 공지</span>
      </label>
      {(category === "K" || category === "I") && (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isRelease}
            onChange={(e) => {
              const isChecked = e.target.checked;
              onIsReleaseChange(isChecked);
              if (isChecked) {
                onIsGlobalChange(false);
              }
            }}
            className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-600"
          />
          <span className="text-xs font-bold text-emerald-600">릴리즈</span>
        </label>
      )}
    </div>
  );
}
