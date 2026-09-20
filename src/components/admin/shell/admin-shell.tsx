/** 관리자 화면 배경 */

import type { ReactNode } from "react";

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-zinc-100 text-[var(--color-text-primary)]">
      {children}
    </div>
  );
}
