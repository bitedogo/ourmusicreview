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
 * 리뷰 상세 본문 카드 (Figma Group 103 / Frame 104 · 모바일 SVG 기준)
 * 카드 343 / Rating 75·상단 -24 / 구분선 inset left 86 · right 22
 */
export const REVIEW_DETAIL_BODY = {
  root: "relative mt-[40px] w-full overflow-visible sm:mt-[50px]",
  shell: `relative w-full overflow-visible ${REVIEW_CARD_SHELL_CLASS}`,

  rating: {
    box: "absolute z-10 box-border flex flex-col items-center justify-center rounded-[15px] border bg-white pt-1 left-0 top-[-24px] h-[75px] w-[75px] sm:left-[-23px] sm:top-[-20px] sm:h-[131px] sm:w-[131px]",
    label:
      "shrink-0 text-center text-[12px] font-bold leading-[14px] tracking-[0.05em] sm:text-[24px] sm:leading-[29px]",
    score:
      "flex h-[33px] w-[65px] shrink-0 items-center justify-center text-center text-[32px] font-bold leading-[38px] sm:h-[66px] sm:w-[97px] sm:text-[64px] sm:leading-[76px]",
  },

  /**
   * 모바일 작성자·구분선 — 좌우 inset만 고정, 너비에 따라 늘어남
   * (343 기준 left 86 · right 22 ≈ 기존 234.53 폭)
   */
  author: {
    root: "relative h-[52px] sm:hidden",
    row: "absolute left-[86px] right-[22px] top-0 flex h-[51px] items-start justify-between gap-2 pt-3",
    meta: "min-w-0 pt-px",
    nickname:
      "block truncate text-[12px] font-medium leading-[14px] text-black hover:underline",
    date: "mt-0.5 block text-[10px] font-normal leading-[12px] text-[#D9D9D9]",
    actions: "flex shrink-0 items-center gap-1.5 pt-[7px]",
    divider:
      "absolute left-[86px] right-[22px] bottom-0 h-px bg-[#D9D9D9]",
  },

  desktopAuthor: {
    root: "absolute left-[131px] top-[23px] z-[1] hidden min-w-0 items-center gap-[14px] sm:flex",
    nickname:
      "min-w-0 truncate text-[24px] font-medium leading-[29px] text-black hover:underline",
    date: "shrink-0 text-[14px] font-normal leading-[17px] text-black",
    actions: "hidden justify-end gap-3 px-[50px] pb-[40px] sm:flex",
  },

  content:
    "px-[28px] pb-6 pt-5 text-[14px] font-normal leading-[200%] text-black sm:px-[50px] sm:pb-[40px] sm:pt-[157px]",
  reject:
    "mx-4 mb-6 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-900 sm:mx-[50px]",

  ownerAction: {
    mobile:
      "text-[10px] font-normal leading-[12px] text-[#D9D9D9] transition-colors hover:text-[var(--color-brand-primary)]",
    desktop:
      "text-xs font-medium text-zinc-400 transition-colors hover:text-[var(--color-brand-primary)]",
  },

  avatar: {
    mobile: "h-[26px] w-[26px]",
    desktop: "h-10 w-10",
  },
} as const;
