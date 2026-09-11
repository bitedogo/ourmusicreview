/** Chart 지역 탭과 같은 알약 토글 */

import type { HTMLAttributes, ReactNode } from "react";

type PillSize = "default" | "compact";

export function ChartStylePillTrack({
  children,
  className = "",
  size = "default",
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  size?: PillSize;
}) {
  const sizeClass = size === "compact" ? "gap-0.5 p-0.5" : "gap-1 p-1";
  return (
    <div
      {...props}
      className={`chart-region-track inline-flex rounded-full border border-[var(--color-border)] bg-white ${sizeClass} ${className}`}
    >
      {children}
    </div>
  );
}

export function chartStylePillTabClass(
  isActive: boolean,
  size: PillSize = "default"
) {
  const sizeClass =
    size === "compact"
      ? "rounded-full px-2.5 py-0.5 text-[11px] font-semibold leading-[14px] transition"
      : "rounded-full px-5 py-1.5 text-sm font-semibold transition";
  return `${sizeClass} ${
    isActive
      ? "chart-region-tab-active bg-[var(--color-accent)] text-white"
      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
  }`;
}
