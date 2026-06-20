import type { NavLinkItem } from "@/src/lib/navigation/nav-config";
import { INSTAGRAM_URL, SUPPORT_EMAIL } from "@/src/lib/site/contact";

export interface FooterLinkColumnConfig {
  title: string;
  links: NavLinkItem[];
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
      { href: `mailto:${SUPPORT_EMAIL}`, label: "Email" },
      { href: INSTAGRAM_URL, label: "Instagram" },
    ],
  },
];
