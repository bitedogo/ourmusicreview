"use client";
/** 플레이리스트 상세 공통 레이아웃(뒤로가기·로딩·에러) */

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

interface PlaylistDetailShellProps {
  backHref: string;
  backLabel?: string;
  isLoading: boolean;
  error: string | null;
  hasPlaylist: boolean;
  className?: string;
  children: ReactNode;
}

export function PlaylistDetailShell({
  backHref,
  backLabel = "플레이리스트 목록으로",
  isLoading,
  error,
  hasPlaylist,
  className = "mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-10 sm:px-16",
  children,
}: PlaylistDetailShellProps) {
  const router = useRouter();

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => router.push(backHref)}
        className="mb-2 flex w-fit items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-brand-primary)]"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <path
            d="M15 18L9 12L15 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {backLabel}
      </button>

      {isLoading ? (
        <div className="py-12 text-center text-sm text-[var(--color-text-secondary)]">
          플레이리스트를 불러오는 중...
        </div>
      ) : error || !hasPlaylist ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {error ?? "플레이리스트를 찾을 수 없습니다."}
        </div>
      ) : (
        children
      )}
    </div>
  );
}
