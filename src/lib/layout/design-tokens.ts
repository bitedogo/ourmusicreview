
/** 레이아웃·간격 디자인 토큰 (CSS var와 함께 쓰는 JS 상수) */

export const LOGO = {
  width: 141,
  height: 72.9,
} as const;

export const PAGE_PADDING_X =
  "px-[var(--page-padding-x-mobile)] sm:px-[var(--page-padding-x-desktop)]";

export const SITE_CONTAINER_PADDING_X =
  "px-[var(--site-padding-x-mobile)] sm:px-0";
