/** 헤더 아이콘 버튼 */

import type { ReactNode } from "react";

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
