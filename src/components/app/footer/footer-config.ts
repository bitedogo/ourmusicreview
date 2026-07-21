/** 푸터 링크 컬럼 설정 */

import { INSTAGRAM_URL, SUPPORT_EMAIL } from "@/src/lib/site/contact";

export interface FooterLinkItem {
  href: string;
  label: string;
  iconSrc?: string;
  /** 기본 true. 모바일에서 밑줄 없는 링크는 false */
  underline?: boolean;
}

export interface FooterLinkColumnConfig {
  title: string;
  links: FooterLinkItem[];
}

export const FOOTER_LINK_COLUMNS: FooterLinkColumnConfig[] = [
  {
    title: "Policy",
    links: [
      { href: "/policies/terms", label: "Terms of Service" },
      { href: "/policies/privacy", label: "Privacy Policy" },
      { href: "/policies/community-guidelines", label: "Community Guidelines" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/boards/notice", label: "Announcements" },
      { href: "/faq", label: "FAQ" },
    ],
  },
  {
    title: "Contact",
    links: [
      { href: `mailto:${SUPPORT_EMAIL}`, label: "E-mail", underline: false },
      { href: INSTAGRAM_URL, label: "Instagram", iconSrc: "/social/instagram.svg" },
    ],
  },
];
