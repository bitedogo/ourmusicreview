/** 헤더·푸터 네비게이션 메뉴 설정 */

export interface NavLinkItem {
  href: string;
  label: string;
}

export const ALBUM_REVIEW_LINK: NavLinkItem = {
  href: "/reviews",
  label: "앨범 리뷰",
};

export const BOARD_LINKS: NavLinkItem[] = [
  { href: "/boards/domestic", label: "국내게시판" },
  { href: "/boards/overseas", label: "해외게시판" },
  { href: "/boards/market", label: "장터게시판" },
  { href: "/boards/workroom", label: "워크룸" },
];

export const NAV_LINKS: NavLinkItem[] = [ALBUM_REVIEW_LINK, ...BOARD_LINKS];

export const ADMIN_LINKS: NavLinkItem[] = [
  { href: "/admin/reviews", label: "리뷰 승인 관리" },
  { href: "/admin/members", label: "멤버 관리" },
  { href: "/admin/reports", label: "신고 관리" },
  { href: "/admin/albums", label: "오늘의 앨범" },
  { href: "/admin/featured-slide", label: "슬라이드바 편집" },
  { href: "/admin/faq", label: "FAQ 관리" },
  { href: "/admin/inquiries", label: "1:1 문의" },
];
