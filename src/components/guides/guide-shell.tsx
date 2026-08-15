/** 가이드 사이드바·본문 셸 */

import Link from "next/link";

export interface GuideNavItem {
  slug: string;
  number: string;
  title: string;
}

interface GuideShellProps {
  basePath: string;
  label: string;
  docs: readonly GuideNavItem[];
  activeSlug?: string;
  children: React.ReactNode;
}

function GuideNav({
  basePath,
  docs,
  activeSlug,
}: {
  basePath: string;
  docs: readonly GuideNavItem[];
  activeSlug?: string;
}) {
  const indexActive = !activeSlug;

  return (
    <nav className="flex flex-col gap-1">
      <Link
        href={basePath}
        className={`rounded-lg px-3 py-2 text-sm transition-colors ${
          indexActive
            ? "bg-[rgba(67,167,178,0.12)] font-semibold text-[var(--color-brand-primary)]"
            : "text-[var(--color-text-primary)] hover:bg-zinc-50"
        }`}
      >
        시작하기
      </Link>
      {docs.map((doc) => {
        const active = doc.slug === activeSlug;
        return (
          <Link
            key={doc.slug}
            href={`${basePath}/${doc.slug}`}
            className={`rounded-lg px-3 py-2 text-sm transition-colors ${
              active
                ? "bg-[rgba(67,167,178,0.12)] font-semibold text-[var(--color-brand-primary)]"
                : "text-[var(--color-text-primary)] hover:bg-zinc-50"
            }`}
          >
            <span className="mr-2 font-mono text-xs text-[var(--color-text-secondary)]">
              {doc.number}
            </span>
            {doc.title}
          </Link>
        );
      })}
    </nav>
  );
}

export function GuideShell({
  basePath,
  label,
  docs,
  activeSlug,
  children,
}: GuideShellProps) {
  return (
    <div className="min-h-screen bg-zinc-50/70">
      <div className="mx-auto flex w-full max-w-6xl gap-10 px-4 py-8 sm:px-8 lg:px-10 lg:py-12">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-8 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <p className="mb-3 px-3 text-xs font-semibold tracking-wide text-[var(--color-text-secondary)]">
              {label}
            </p>
            <GuideNav basePath={basePath} docs={docs} activeSlug={activeSlug} />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <details className="mb-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm lg:hidden">
            <summary className="cursor-pointer text-sm font-semibold text-[var(--color-text-primary)]">
              문서 목차
            </summary>
            <div className="mt-3">
              <GuideNav basePath={basePath} docs={docs} activeSlug={activeSlug} />
            </div>
          </details>
          {children}
        </div>
      </div>
    </div>
  );
}
