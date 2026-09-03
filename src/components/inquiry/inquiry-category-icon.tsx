/** 문의 유형 아이콘 */

import type { ReactNode } from "react";
import type { InquiryCategory } from "@/src/lib/inquiries/types";

function IconShell({ children }: { children: ReactNode }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

const CATEGORY_ICONS: Record<InquiryCategory, ReactNode> = {
  ACCOUNT: (
    <IconShell>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c0-3.5 3.1-6 7-6s7 2.5 7 6" />
    </IconShell>
  ),
  PAYMENT: (
    <IconShell>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M3 10h18" />
    </IconShell>
  ),
  REPORT: (
    <IconShell>
      <path d="M12 3 4 21h16L12 3z" />
      <path d="M12 9v4" />
      <circle cx="12" cy="17" r="0.8" fill="currentColor" stroke="none" />
    </IconShell>
  ),
  BUG: (
    <IconShell>
      <path d="M8 11h8M10 7h4M9 15h6" />
      <ellipse cx="12" cy="13" rx="4" ry="5" />
      <path d="M6 9 4 7M18 9l2-2M6 17l-2 2M18 17l2 2" />
    </IconShell>
  ),
  FEATURE: (
    <IconShell>
      <path d="M9 18h6M10 22h4" />
      <path d="M12 2a6 6 0 0 0-4 10c.8.8 1.5 1.2 2 1.3V16h4v-2.7c.5-.1 1.2-.5 2-1.3A6 6 0 0 0 12 2z" />
    </IconShell>
  ),
  ETC: (
    <IconShell>
      <circle cx="6" cy="12" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="18" cy="12" r="1.2" fill="currentColor" stroke="none" />
    </IconShell>
  ),
};

export function InquiryCategoryIcon({ category }: { category: InquiryCategory }) {
  return CATEGORY_ICONS[category];
}
