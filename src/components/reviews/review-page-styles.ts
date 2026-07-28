/** 앨범/리뷰 UI 공통 스타일 */

export const REVIEW_PAGE_TITLE_CLASS =
  "h-[30px] text-[28px] font-semibold leading-[33px] text-black";

/**
 * 바깥 셸 — 테두리·그림자는 여기에만.
 * overflow-hidden 과 같은 노드에 두면 라운드 클립 AA 로
 * 좌·하단 1px 회색 헤어라인이 생김.
 */
export const REVIEW_CARD_SHELL_CLASS =
  "rounded-[15px] bg-white shadow-[0_0_0_1px_#D9D9D9,0px_2px_4px_rgba(0,0,0,0.25)]";

/** 안쪽 클립 — 커버·배지를 카드 R로 자름 (셸과 분리) */
export const REVIEW_CARD_CLIP_CLASS = "overflow-hidden rounded-[15px]";

/** 커버 좌하단은 직각 — 레이팅 배지 아래 커버 라운드 비침 방지 */
export const REVIEW_COVER_RADIUS_CLASS =
  "rounded-tl-[10px] rounded-tr-[10px] rounded-br-[10px] rounded-bl-none";

export const REVIEW_BRAND_TEAL = "#43A7B2";
