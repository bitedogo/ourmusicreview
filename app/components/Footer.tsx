import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto w-full border-t border-zinc-800 bg-black">
      <div className="flex w-full flex-row flex-nowrap items-start justify-center px-4 py-5 sm:justify-between sm:px-16 sm:py-10">
        <div className="hidden min-w-0 shrink flex-col sm:flex">
          <p className="max-w-xs text-sm leading-relaxed text-white">
            음악을 기록하고, 그 속에 담긴 당신의 가치를 나누는 공간
          </p>
          <p className="mt-2 max-w-xs text-xs leading-relaxed text-zinc-400">
            단순히 듣는 것을 넘어, 음악이 남긴 여운을 기록하세요.
            <br />
            우리가 함께 나누는 문장들이 모여 새로운 음악적 발견이 됩니다.
          </p>
          <p className="mt-4 text-xs text-zinc-400">
            © 2026 ORU. All rights reserved.
          </p>
          <p className="mt-3 text-xs text-zinc-500">
            Powered by Team ORU
          </p>
        </div>

        <div className="mx-auto grid w-max shrink-0 grid-cols-3 gap-x-3 gap-y-0 sm:mx-0 sm:gap-x-5">
          <div className="flex flex-col items-start gap-2 sm:gap-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400 sm:text-xs sm:tracking-wider">
              Policy
            </p>
            <nav className="flex flex-col items-start gap-1.5 sm:gap-2">
              <Link
                href="/policies/terms"
                className="text-[11px] font-medium leading-4 text-zinc-400 underline underline-offset-2 transition hover:text-[var(--color-brand-primary)] sm:text-sm"
              >
                Terms of Service
              </Link>
              <Link
                href="/policies/privacy"
                className="text-[11px] font-medium leading-4 text-zinc-400 underline underline-offset-2 transition hover:text-[var(--color-brand-primary)] sm:text-sm"
              >
                Privacy Policy
              </Link>
              <Link
                href="/policies/community-guidelines"
                className="text-[11px] font-medium leading-4 text-zinc-400 underline underline-offset-2 transition hover:text-[var(--color-brand-primary)] sm:text-sm"
              >
                Community Guidelines
              </Link>
            </nav>
          </div>
          <div className="flex flex-col items-start gap-2 sm:gap-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400 sm:text-xs sm:tracking-wider">
              Support
            </p>
            <nav className="flex flex-col items-start gap-1.5 sm:gap-2">
              <Link
                href="/boards/notice"
                className="text-[11px] font-medium leading-4 text-zinc-400 underline underline-offset-2 transition hover:text-[var(--color-brand-primary)] sm:text-sm"
              >
                Announcements
              </Link>
              <Link
                href="/faq"
                className="text-[11px] font-medium leading-4 text-zinc-400 underline underline-offset-2 transition hover:text-[var(--color-brand-primary)] sm:text-sm"
              >
                FAQ
              </Link>
            </nav>
          </div>
          <div className="flex flex-col items-start gap-2 sm:gap-3">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400 sm:text-xs sm:tracking-wider">
              Contact
            </p>
            <nav className="flex flex-col items-start gap-1.5 sm:gap-2">
              <a
                href="mailto:jaewoo1567@gmail.com"
                className="text-[11px] font-medium leading-4 text-zinc-400 underline underline-offset-2 transition hover:text-[var(--color-brand-primary)] sm:text-sm"
              >
                Email
              </a>
              <a
                href="https://www.instagram.com/comeonoru"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-medium leading-4 text-zinc-400 underline underline-offset-2 transition hover:text-[var(--color-brand-primary)] sm:text-sm"
              >
                Instagram
              </a>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
