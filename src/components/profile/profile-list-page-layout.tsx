"use client";
/** 프로필 하위 목록 페이지 레이아웃 */

import { useRouter } from "next/navigation";

interface ProfileListPageLayoutProps {
  title: string;
  description?: string;
  isLoading: boolean;
  error: string | null;
  emptyMessage: string;
  isEmpty: boolean;
  loadingMessage?: string;
  children: React.ReactNode;
}

export function ProfileListPageLayout({
  title,
  description,
  isLoading,
  error,
  emptyMessage,
  isEmpty,
  loadingMessage = "불러오는 중...",
  children,
}: ProfileListPageLayoutProps) {
  const router = useRouter();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-10 sm:px-16">
      <section className="space-y-2">
        <button
          type="button"
          onClick={() => router.push("/profile")}
          className="mb-4 flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-brand-primary)]"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15 18L9 12L15 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          마이페이지로
        </button>
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        {description ? (
          <p className="text-xs text-[var(--color-text-secondary)]">{description}</p>
        ) : null}
      </section>

      {isLoading ? (
        <div className="py-12 text-center text-sm text-[var(--color-text-secondary)]">{loadingMessage}</div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {error}
        </div>
      ) : isEmpty ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-12 text-center text-sm text-[var(--color-text-secondary)]">
          {emptyMessage}
        </div>
      ) : (
        children
      )}
    </div>
  );
}
