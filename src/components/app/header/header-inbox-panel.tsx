/** 헤더 인박스 드롭다운 껍데기 */

import type { ReactNode } from "react";
import { HeaderDropdownPanel } from "./header-dropdown-panel";

interface HeaderInboxPanelProps {
  title: string;
  widthClass: string;
  action?: ReactNode;
  children: ReactNode;
}

export function HeaderInboxPanel({
  title,
  widthClass,
  action,
  children,
}: HeaderInboxPanelProps) {
  return (
    <div className={`absolute right-0 top-full z-50 mt-2 ${widthClass}`}>
      <HeaderDropdownPanel>
        <div className="flex items-center justify-between border-b border-zinc-100 px-3 py-2">
          <h3 className="text-xs font-semibold text-[var(--color-text-primary)]">
            {title}
          </h3>
          {action}
        </div>
        {children}
      </HeaderDropdownPanel>
    </div>
  );
}

export function HeaderInboxStatus({ children }: { children: ReactNode }) {
  return (
    <p className="px-3 py-4 text-xs text-[var(--color-text-secondary)]">
      {children}
    </p>
  );
}

export function HeaderInboxTimestamp({ value }: { value: string }) {
  return (
    <p className="mt-0.5 text-[11px] text-[var(--color-text-muted)]">
      {new Date(value).toLocaleString("ko-KR")}
    </p>
  );
}
