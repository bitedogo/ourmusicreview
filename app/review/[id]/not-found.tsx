/** 리뷰 상세 404 */

import Link from "next/link";

export default function ReviewNotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] w-full max-w-lg flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <h1 className="text-xl font-semibold tracking-tight text-[var(--color-text-primary)]">
        리뷰를 찾을 수 없습니다
      </h1>
      <p className="text-sm text-[var(--color-text-secondary)]">
        삭제되었거나 존재하지 않는 리뷰입니다.
      </p>
      <Link
        href="/reviews"
        className="rounded-full bg-[var(--color-brand-primary)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--color-brand-primary-hover)]"
      >
        리뷰 목록으로
      </Link>
    </div>
  );
}
