"use client";
/** 내부 가이드 비밀번호 입력 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchJson, getApiErrorMessage } from "@/src/lib/http/client";

interface GuideAccessFormProps {
  nextPath: string;
}

export function GuideAccessForm({ nextPath }: GuideAccessFormProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const label = nextPath.startsWith("/developer")
    ? "개발자 가이드"
    : "디자이너 가이드";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await fetchJson<{ ok: true; data: { next: string } }>("/api/guide-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, next: nextPath }),
      });
      router.replace(nextPath);
      router.refresh();
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, "비밀번호가 올바르지 않습니다."));
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[360px] rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8"
      >
        <p className="text-xs font-semibold tracking-wide text-[var(--color-brand-primary)]">
          내부 문서
        </p>
        <h1 className="mt-2 text-xl font-semibold text-[var(--color-text-primary)]">
          {label}
        </h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          비밀번호를 입력하면 문서를 볼 수 있습니다.
        </p>
        <label className="mt-6 block">
          <span className="sr-only">비밀번호</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            placeholder="비밀번호"
            className="h-[44px] w-full rounded-[10px] border border-[#E3E3E3] bg-white px-4 text-[15px] text-[var(--color-text-primary)] outline-none placeholder:text-[#C4C4C4] focus:border-[var(--color-brand-primary)] sm:h-[50px] sm:rounded-[15px] sm:text-[18px]"
          />
        </label>
        {error ? (
          <p className="mt-3 text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={isSubmitting || !password}
          className="mt-5 w-full rounded-full bg-[var(--color-brand-primary)] py-3 text-sm font-medium text-white transition hover:bg-[var(--color-brand-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "확인 중…" : "입장"}
        </button>
      </form>
    </div>
  );
}
