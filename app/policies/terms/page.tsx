import Link from "next/link";
import { TermsContent } from "@/app/components/TermsContent";

export default function TermsPage() {
  return (
    <div className="mx-auto min-h-screen max-w-3xl px-6 py-16">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900">
          이용약관
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          Terms of Service
        </p>
      </header>

      <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm sm:p-12">
        <TermsContent />

        <div className="mt-12 pt-6 border-t border-zinc-200">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-600 underline hover:text-[var(--color-brand-primary)]"
          >
            ← 홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
