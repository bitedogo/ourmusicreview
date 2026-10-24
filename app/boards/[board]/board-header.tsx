/** 게시판 헤더: 제목, 설명, 글쓰기 버튼 */

import type { ReactNode } from "react";
import Link from "next/link";

interface BoardHeaderProps {
  title: string;
  descriptionHtml: string;
  canWrite: boolean;
  writeHref: string;
  actions?: ReactNode;
}

export function BoardHeader({
  title,
  descriptionHtml,
  canWrite,
  writeHref,
  actions,
}: BoardHeaderProps) {
  return (
    <section>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        {(actions || canWrite) && (
          <div className="flex shrink-0 items-center gap-2">
            {actions}
            {canWrite ? (
              <Link
                href={writeHref}
                className="rounded-full bg-[var(--color-brand-primary)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--color-brand-primary-hover)] whitespace-nowrap"
              >
                글쓰기
              </Link>
            ) : null}
          </div>
        )}
      </div>
      <p
        className="mt-1 text-xs text-[var(--color-text-secondary)]"
        dangerouslySetInnerHTML={{ __html: descriptionHtml }}
      />
    </section>
  );
}
