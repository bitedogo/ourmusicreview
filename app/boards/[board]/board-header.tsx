/** 게시판 헤더: 제목, 설명, 글쓰기 버튼 */

import Link from "next/link";

interface BoardHeaderProps {
  title: string;
  descriptionHtml: string;
  canWrite: boolean;
  writeHref: string;
}

export function BoardHeader({
  title,
  descriptionHtml,
  canWrite,
  writeHref,
}: BoardHeaderProps) {
  return (
    <section className="flex items-start justify-between gap-3">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        <p
          className="mt-1 text-xs text-zinc-500"
          dangerouslySetInnerHTML={{ __html: descriptionHtml }}
        />
      </div>
      <div className="flex items-center gap-2">
        {canWrite && (
          <Link
            href={writeHref}
            className="rounded-full bg-[var(--color-brand-primary)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--color-brand-primary-hover)] whitespace-nowrap"
          >
            글쓰기
          </Link>
        )}
      </div>
    </section>
  );
}
