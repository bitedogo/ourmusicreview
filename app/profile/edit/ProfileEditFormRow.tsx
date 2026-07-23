/** 내 정보 수정 — 라벨/본문 행 */

import type { ReactNode } from "react";

interface ProfileEditFormRowProps {
  label: string;
  children: ReactNode;
  bordered?: boolean;
}

export function ProfileEditFormRow({
  label,
  children,
  bordered = true,
}: ProfileEditFormRowProps) {
  return (
    <div
      className={`grid grid-cols-[120px_1fr] ${
        bordered ? "border-b border-zinc-200" : ""
      }`}
    >
      <div className="bg-zinc-50 px-4 py-4 text-base font-semibold text-zinc-700">
        {label}
      </div>
      <div className="px-5 py-3">{children}</div>
    </div>
  );
}

export const PROFILE_EDIT_PRIMARY_BTN =
  "rounded bg-[var(--color-brand-primary)] px-4 py-2 text-xs font-medium text-white transition hover:bg-[var(--color-brand-primary-hover)] disabled:cursor-not-allowed disabled:bg-zinc-400";

export const PROFILE_EDIT_INPUT =
  "rounded border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-400";
