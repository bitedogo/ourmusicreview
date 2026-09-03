/** 헤더 아이콘 버튼 */

import type { ReactNode } from "react";

/** 헤더 아이콘 위에 올라가는 빨간 숫자 뱃지 */
export function UnreadBadge({ count, className = "" }: { count: number; className?: string }) {
  if (count <= 0) return null;
  return (
    <span
      className={`inline-flex min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-4 text-white ${className}`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

interface HeaderIconButtonProps {
  label: string;
  expanded: boolean;
  onClick: () => void;
  children: ReactNode;
}

export function HeaderIconButton({
  label,
  expanded,
  onClick,
  children,
}: HeaderIconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-expanded={expanded}
      onClick={onClick}
      className="relative rounded-full text-[var(--color-text-primary)] transition hover:text-[var(--color-accent)]"
    >
      {children}
    </button>
  );
}
