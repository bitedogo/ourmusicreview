"use client";
/** 세그먼트 런타임 에러 바운더리 */

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[50vh] w-full max-w-lg flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <h1 className="text-xl font-semibold tracking-tight text-[var(--color-text-primary)]">
        문제가 발생했습니다
      </h1>
      <p className="text-sm text-[var(--color-text-secondary)]">
        일시적인 오류일 수 있습니다. 잠시 후 다시 시도해 주세요.
      </p>
      {process.env.NODE_ENV !== "production" && error?.message ? (
        <p className="w-full break-words rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-left text-xs text-[var(--color-text-muted)]">
          {error.message}
          {error.digest ? ` · digest: ${error.digest}` : ""}
        </p>
      ) : null}
      <button
        type="button"
        onClick={() => reset()}
        className="rounded-full bg-[var(--color-brand-primary)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--color-brand-primary-hover)]"
      >
        다시 시도
      </button>
    </div>
  );
}
