/** 게시판 슬러그 404 */

import Link from "next/link";

export default function BoardNotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] w-full max-w-lg flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <h1 className="text-xl font-semibold tracking-tight text-[var(--color-text-primary)]">
        게시판을 찾을 수 없습니다
      </h1>
      <p className="text-sm text-[var(--color-text-secondary)]">
        존재하지 않는 게시판 경로입니다.
      </p>
      <Link
        href="/boards/domestic"
        className="rounded-full bg-[var(--color-brand-primary)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--color-brand-primary-hover)]"
      >
        국내 게시판으로
      </Link>
    </div>
  );
}
