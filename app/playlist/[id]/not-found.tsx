/** 플레이리스트 상세 404 */

import Link from "next/link";

export default function PlaylistNotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] w-full max-w-lg flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      <h1 className="text-xl font-semibold tracking-tight text-[var(--color-text-primary)]">
        플레이리스트를 찾을 수 없습니다
      </h1>
      <p className="text-sm text-[var(--color-text-secondary)]">
        비공개이거나 삭제된 플레이리스트일 수 있습니다.
      </p>
      <Link
        href="/playlist"
        className="rounded-full bg-[var(--color-brand-primary)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--color-brand-primary-hover)]"
      >
        플레이리스트 목록으로
      </Link>
    </div>
  );
}
