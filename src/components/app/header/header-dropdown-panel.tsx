/** 헤더 드롭다운 패널 */

import type { ReactNode } from "react";

interface HeaderDropdownPanelProps {
  children: ReactNode;
  className?: string;
}

export function HeaderDropdownPanel({
  children,
  className = "",
}: HeaderDropdownPanelProps) {
  return (
    <div
      className={`overflow-hidden rounded-lg border border-zinc-200 bg-white py-1.5 shadow-lg ${className}`}
    >
      {children}
    </div>
  );
}
