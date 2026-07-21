/** 활동 통계 박스 (게시글 · 댓글 · 추천) */

import Link from "next/link";

interface ActivityStatBoxProps {
  label: string;
  count: number;
  href?: string;
}

export function ActivityStatBox({ label, count, href }: ActivityStatBoxProps) {
  const body = (
    <div className="box-border flex h-[52px] w-full flex-col items-center justify-center gap-0.5 rounded-[10px] border border-[#D9D9D9] bg-white px-1.5 text-center text-[11px] leading-[13px] text-black transition hover:border-[#43A7B2] sm:h-[60px] sm:flex-row sm:justify-between sm:gap-0 sm:px-4 sm:text-left sm:text-[13px] sm:leading-[16px] lg:w-[320px] lg:flex-none lg:px-[27px] lg:text-[14px] lg:leading-[17px]">
      <span className="max-w-full truncate">{label}</span>
      <span className="shrink-0 sm:text-right">{count}개</span>
    </div>
  );

  if (!href) {
    return <div className="min-w-0 flex-1 lg:w-[320px] lg:flex-none">{body}</div>;
  }

  return (
    <Link href={href} className="block min-w-0 flex-1 lg:w-[320px] lg:flex-none">
      {body}
    </Link>
  );
}
