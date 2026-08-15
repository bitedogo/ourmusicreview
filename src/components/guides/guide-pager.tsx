import Link from "next/link";
import type { GuideNavItem } from "@/src/components/guides/guide-shell";

interface GuidePagerProps {
  basePath: string;
  prev: GuideNavItem | null;
  next: GuideNavItem | null;
}

export function GuidePager({ basePath, prev, next }: GuidePagerProps) {
  return (
    <div className="mt-12 grid gap-3 border-t border-zinc-200 pt-8 sm:grid-cols-2">
      {prev ? (
        <Link
          href={`${basePath}/${prev.slug}`}
          className="rounded-xl border border-zinc-200 bg-white px-4 py-3 transition-colors hover:border-[var(--color-brand-primary)]"
        >
          <p className="text-xs text-[var(--color-text-secondary)]">이전</p>
          <p className="mt-1 text-sm font-semibold text-[var(--color-text-primary)]">
            {prev.number}. {prev.title}
          </p>
        </Link>
      ) : (
        <div />
      )}
      {next ? (
        <Link
          href={`${basePath}/${next.slug}`}
          className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-right transition-colors hover:border-[var(--color-brand-primary)]"
        >
          <p className="text-xs text-[var(--color-text-secondary)]">다음</p>
          <p className="mt-1 text-sm font-semibold text-[var(--color-text-primary)]">
            {next.number}. {next.title}
          </p>
        </Link>
      ) : null}
    </div>
  );
}
