/** 헤더·푸터 네비게이션 메뉴 설정 */

import {
  BOARD_CATEGORY_LABEL,
  BOARD_SLUG_BY_CATEGORY,
  USER_WRITE_CATEGORIES,
} from "@/src/lib/community/board-config";
import { boardPath } from "@/src/lib/navigation/routes";

export interface NavLinkItem {
  href: string;
  label: string;
}

export const ALBUM_REVIEW_LINK: NavLinkItem = {
  href: "/reviews",
  label: "앨범 리뷰",
};

export const BOARD_LINKS: NavLinkItem[] = USER_WRITE_CATEGORIES.map((category) => ({
  href: boardPath(BOARD_SLUG_BY_CATEGORY[category]),
  label: BOARD_CATEGORY_LABEL[category],
}));

export const NAV_LINKS: NavLinkItem[] = [ALBUM_REVIEW_LINK, ...BOARD_LINKS];

export const ADMIN_HOME_LINK: NavLinkItem = {
  href: "/admin",
  label: "Overview",
};

export const ADMIN_LINKS: NavLinkItem[] = [
  { href: "/admin/reviews", label: "리뷰 승인" },
  { href: "/admin/members", label: "멤버" },
  { href: "/admin/reports", label: "신고" },
  { href: "/admin/albums", label: "오늘의 앨범" },
  { href: "/admin/new-releases", label: "신보" },
  { href: "/admin/featured-slide", label: "슬라이드" },
  { href: "/admin/faq", label: "FAQ" },
  { href: "/admin/inquiries", label: "1:1 문의" },
];
