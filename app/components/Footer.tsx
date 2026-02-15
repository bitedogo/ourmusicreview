import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto w-full border-t border-zinc-200 bg-zinc-100">
      <div className="mx-auto flex max-w-5xl flex-row flex-nowrap items-start justify-between gap-4 px-4 py-6 sm:gap-16 sm:px-10 sm:py-10">
        <div className="flex min-w-0 shrink flex-col gap-2">
          <Link
            href="/"
            className="text-lg font-semibold tracking-[0.2em] text-zinc-900"
          >
            ORU
          </Link>
          <p className="max-w-xs text-sm leading-relaxed text-zinc-600">
            음악을 기록하고, 가치를 나누는 공간
          </p>
          <p className="text-xs text-zinc-500">
            © 2026 ORU. All rights reserved.
          </p>
        </div>

        <div className="flex shrink-0 gap-6 sm:gap-16">
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              정책
            </p>
            <nav className="flex flex-col gap-2">
              <Link
                href="/policies/terms"
                className="text-sm font-medium text-zinc-700 underline underline-offset-2 transition hover:text-zinc-900"
              >
                이용약관
              </Link>
              <Link
                href="/policies/privacy"
                className="text-sm font-medium text-zinc-700 underline underline-offset-2 transition hover:text-zinc-900"
              >
                개인정보처리방침
              </Link>
            </nav>
          </div>
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              문의
            </p>
            <nav className="flex flex-col gap-2">
              <a
                href="https://www.instagram.com/comeonoru"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-zinc-700 underline underline-offset-2 transition hover:text-zinc-900"
              >
                인스타그램
              </a>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
