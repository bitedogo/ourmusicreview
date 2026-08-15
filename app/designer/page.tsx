/** 디자이너 가이드 색인 (/designer) */

import Link from "next/link";
import { DesignerSpecimens } from "@/src/components/designer/specimens";
import { MarkdownBody } from "@/src/components/developer/markdown-body";
import { GuideShell } from "@/src/components/guides/guide-shell";
import { DESIGNER_DOCS, readDesignerMarkdown } from "@/src/lib/designer/docs";

export default async function DesignerIndexPage() {
  const markdown = await readDesignerMarkdown("README.md");

  return (
    <GuideShell basePath="/designer" label="DESIGNER GUIDE" docs={DESIGNER_DOCS}>
      <article className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-10">
        <MarkdownBody markdown={markdown} basePath="/designer" />
        <DesignerSpecimens />

        <ol className="mt-10 grid gap-3 sm:grid-cols-2">
          {DESIGNER_DOCS.map((doc) => (
            <li key={doc.slug}>
              <Link
                href={`/designer/${doc.slug}`}
                className="flex h-full flex-col rounded-xl border border-zinc-200 px-4 py-4 transition-colors hover:border-[var(--color-brand-primary)] hover:bg-[rgba(67,167,178,0.04)]"
              >
                <span className="font-mono text-xs text-[var(--color-brand-primary)]">
                  {doc.number}
                </span>
                <span className="mt-1 font-semibold text-[var(--color-text-primary)]">
                  {doc.title}
                </span>
                <span className="mt-1 text-sm text-[var(--color-text-secondary)]">
                  {doc.summary}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </article>
    </GuideShell>
  );
}
