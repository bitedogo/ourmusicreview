/** 개발자 가이드 챕터 (/developer/[slug]) */

import { notFound } from "next/navigation";
import { DocPager } from "@/src/components/developer/doc-pager";
import { DocsShell } from "@/src/components/developer/docs-shell";
import { MarkdownBody } from "@/src/components/developer/markdown-body";
import {
  DEVELOPER_DOCS,
  getAdjacentDocs,
  getDeveloperDoc,
  readDeveloperMarkdown,
} from "@/src/lib/developer/docs";

interface DeveloperDocPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return DEVELOPER_DOCS.map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({ params }: DeveloperDocPageProps) {
  const { slug } = await params;
  const doc = getDeveloperDoc(slug);
  return {
    title: doc ? `${doc.number}. ${doc.title}` : "개발자 가이드",
    robots: { index: false, follow: false },
  };
}

export default async function DeveloperDocPage({ params }: DeveloperDocPageProps) {
  const { slug } = await params;
  const doc = getDeveloperDoc(slug);
  if (!doc) {
    notFound();
  }

  const markdown = await readDeveloperMarkdown(doc.file);
  const { prev, next } = getAdjacentDocs(slug);

  return (
    <DocsShell activeSlug={slug}>
      <article className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-10">
        <p className="text-xs font-semibold tracking-wide text-[var(--color-brand-primary)]">
          {doc.number} · DEVELOPER GUIDE
        </p>
        <MarkdownBody markdown={markdown} />
        <DocPager prev={prev} next={next} />
      </article>
    </DocsShell>
  );
}
