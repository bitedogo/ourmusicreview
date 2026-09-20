"use client";
/** 커뮤니티 글쓰기 - 관리자 전용 토글 (전체 공지) */

interface AdminPostTogglesProps {
  isGlobal: boolean;
  onIsGlobalChange: (value: boolean) => void;
}

export function AdminPostToggles({
  isGlobal,
  onIsGlobalChange,
}: AdminPostTogglesProps) {
  return (
    <div className="flex shrink-0 items-center gap-3">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={isGlobal}
          onChange={(e) => onIsGlobalChange(e.target.checked)}
          className="h-4 w-4 rounded border-zinc-300 text-[var(--color-text-primary)] focus:ring-black"
        />
        <span className="text-xs font-bold text-red-600">전체 공지</span>
      </label>
    </div>
  );
}
