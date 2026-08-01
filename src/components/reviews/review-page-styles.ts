/** 앨범/리뷰 UI 공통 스타일 */

/** 목록 툴바·카드 공통 폭 — 필터/검색과 카드 좌우 정렬 */
export const REVIEW_LIST_CONTENT_CLASS = "mx-auto w-full max-w-[800px]";

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
export const REVIEW_BORDER_GRAY = "#D9D9D9";

/**
 * 리뷰 상세 본문 카드 (Figma Group 103 / Frame 104)
 * — 앨범 카드 ↔ 본문 간격 · Rating 박스 크기·걸침
 */
export const REVIEW_DETAIL_BODY = {
  /** 앨범 카드 ↔ 본문 박스 상단 간격 */
  gapFromAlbum: {
    mobile: "mt-[40px]",
    desktop: "sm:mt-[50px]",
  },
  rating: {
    box: "absolute z-10 box-border flex flex-col items-center justify-center rounded-[15px] border bg-white pt-1 left-0 top-[-24px] h-[75px] w-[75px] sm:left-[-23px] sm:top-[-20px] sm:h-[131px] sm:w-[131px]",
    label:
      "shrink-0 text-center text-[12px] font-bold leading-[14px] tracking-[0.05em] sm:text-[24px] sm:leading-[29px]",
    score:
      "flex h-[33px] w-[65px] shrink-0 items-center justify-center text-center text-[32px] font-bold leading-[38px] sm:h-[66px] sm:w-[97px] sm:text-[64px] sm:leading-[76px]",
  },
  authorOffset: {
    /** Rating 75 + gap ≈ 아바타 시작 */
    mobile: "pl-[86px]",
    desktop: "left-[131px]",
  },
} as const;
