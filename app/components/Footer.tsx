import Link from "next/link";

/**
 * 사이트 하단 푸터 컴포넌트.
 * 로고, 태그라인, 저작권 정보 및 정책/문의 링크를 포함합니다.
 */
export function Footer() {
  return (
    <footer className="mt-auto w-full border-t border-zinc-800 bg-black">
      <div className="flex w-full flex-row flex-nowrap items-start justify-between px-8 py-6 sm:px-16 sm:py-10">
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

        <div className="grid shrink-0 grid-cols-3 gap-x-6 gap-y-0">
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Policy
            </p>
            <nav className="flex flex-col gap-2">
              <Link
                href="/policies/terms"
                className="text-sm font-medium text-zinc-400 underline underline-offset-2 transition hover:text-zinc-300"
              >
                Terms of Service
              </Link>
              <Link
                href="/policies/privacy"
                className="text-sm font-medium text-zinc-400 underline underline-offset-2 transition hover:text-zinc-300"
              >
                Privacy Policy
              </Link>
              <Link
                href="/policies/community-guidelines"
                className="text-sm font-medium text-zinc-400 underline underline-offset-2 transition hover:text-zinc-300"
              >
                Community Guidelines
              </Link>
            </nav>
          </div>
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Support
            </p>
            <nav className="flex flex-col gap-2">
              <Link
                href="/boards/notice"
                className="text-sm font-medium text-zinc-400 underline underline-offset-2 transition hover:text-zinc-300"
              >
                Announcements
              </Link>
              <Link
                href="/faq"
                className="text-sm font-medium text-zinc-400 underline underline-offset-2 transition hover:text-zinc-300"
              >
                FAQ
              </Link>
            </nav>
          </div>
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Contact
            </p>
            <nav className="flex flex-col gap-2">
              <a
                href="mailto:jaewoo1567@gmail.com"
                className="text-sm font-medium text-zinc-400 underline underline-offset-2 transition hover:text-zinc-300"
              >
                Email
              </a>
              <a
                href="https://www.instagram.com/comeonoru"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-zinc-400 underline underline-offset-2 transition hover:text-zinc-300"
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
