import type { ReactNode } from "react";

interface EmptyStateProps {
  children: ReactNode;
  className?: string;
}

export function EmptyState({ children, className = "" }: EmptyStateProps) {
  return (
    <div
      className={`rounded-[var(--featured-cover-radius)] border border-dashed border-[var(--color-border)] bg-zinc-50 px-[var(--featured-card-padding)] py-[var(--featured-card-gap)] text-center text-[length:var(--text-today-album-body-mobile)] text-[var(--color-text-secondary)] ${className}`.trim()}
    >
      {children}
    </div>
  );
}
