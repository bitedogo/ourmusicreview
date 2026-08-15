/** 디자이너 가이드 챕터 (/designer/[slug]) */

import { notFound } from "next/navigation";
import { DesignerSpecimens } from "@/src/components/designer/specimens";
import { MarkdownBody } from "@/src/components/developer/markdown-body";
import { GuidePager } from "@/src/components/guides/guide-pager";
import { GuideShell } from "@/src/components/guides/guide-shell";
import {
  DESIGNER_DOCS,
  getAdjacentDesignerDocs,
  getDesignerDoc,
  readDesignerMarkdown,
} from "@/src/lib/designer/docs";

interface DesignerDocPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return DESIGNER_DOCS.map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({ params }: DesignerDocPageProps) {
  const { slug } = await params;
  const doc = getDesignerDoc(slug);
  return {
    title: doc ? `${doc.number}. ${doc.title}` : "디자이너 가이드",
    robots: { index: false, follow: false },
  };
}

export default async function DesignerDocPage({ params }: DesignerDocPageProps) {
  const { slug } = await params;
  const doc = getDesignerDoc(slug);
  if (!doc) {
    notFound();
  }

  const markdown = await readDesignerMarkdown(doc.file);
  const { prev, next } = getAdjacentDesignerDocs(slug);

  return (
    <GuideShell
      basePath="/designer"
      label="DESIGNER GUIDE"
      docs={DESIGNER_DOCS}
      activeSlug={slug}
    >
      <article className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-10">
        <p className="text-xs font-semibold tracking-wide text-[var(--color-brand-primary)]">
          {doc.number} · DESIGNER GUIDE
        </p>
        <MarkdownBody markdown={markdown} basePath="/designer" />
        <DesignerSpecimens slug={slug} />
        <GuidePager basePath="/designer" prev={prev} next={next} />
      </article>
    </GuideShell>
  );
}
