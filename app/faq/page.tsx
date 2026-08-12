/** FAQ 공개 페이지 (서버 fetch + 클라 아코디언) */

import { FaqPublicClient } from "@/src/components/faq/faq-public-client";
import { initializeDatabase } from "@/src/lib/db";
import { listFaqs } from "@/src/lib/faq/faq-service";

export default async function FaqPage() {
  const dataSource = await initializeDatabase();
  const faqs = await listFaqs(dataSource);

  return (
    <div className="min-h-screen bg-zinc-50/70">
      <div className="mx-auto max-w-4xl px-6 py-16 sm:px-10">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-[var(--color-text-primary)]">
            자주 묻는 질문
          </h1>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            Frequently asked questions
          </p>
        </header>

        <FaqPublicClient faqs={faqs} />
      </div>
    </div>
  );
}
