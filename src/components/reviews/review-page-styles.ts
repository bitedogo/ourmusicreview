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

/** 모바일 카드 셸 — Figma 343×100, radius 10 */
export const REVIEW_MOBILE_CARD_SHELL_CLASS =
  "rounded-[10px] bg-white shadow-[0_0_0_1px_#D9D9D9,0px_2px_4px_rgba(0,0,0,0.25)]";

/** 안쪽 클립 — 커버·배지를 카드 R로 자름 (셸과 분리) */
export const REVIEW_CARD_CLIP_CLASS = "overflow-hidden rounded-[15px]";

/** 커버 좌하단은 직각 — 레이팅 배지 아래 커버 라운드 비침 방지 */
export const REVIEW_COVER_RADIUS_CLASS =
  "rounded-tl-[10px] rounded-tr-[10px] rounded-br-[10px] rounded-bl-none";

/** 모바일 커버 — radius 6 + 좌하단 배지용 직각 */
export const REVIEW_MOBILE_COVER_RADIUS_CLASS =
  "rounded-tl-[6px] rounded-tr-[6px] rounded-br-[6px] rounded-bl-none";

export const REVIEW_BRAND_TEAL = "#43A7B2";
export const REVIEW_BORDER_GRAY = "#D9D9D9";

/** 리뷰 카드 공통 텍스트 색 (Figma) */
export const REVIEW_TEXT = {
  title: "text-[#505050]",
  /** 상세 앨범 카드 아티스트 */
  artist: "text-[#C4C4C4]",
  /** 미리보기 카드 아티스트 */
  artistMuted: "text-[#949494]",
  meta: "text-[#505050]",
  preview: "text-[#C4C4C4]",
} as const;

const ARTIST_LINK_INTERACTIVE =
  "transition hover:text-[var(--color-brand-primary)] hover:underline disabled:cursor-wait disabled:no-underline";

/** ArtistNameLink용 — 부모와 동일 타이포 + 호버 */
export function reviewArtistLinkClass(typography: string) {
  return `max-w-full truncate text-left ${typography} ${ARTIST_LINK_INTERACTIVE}`;
}

/**
 * 리뷰 상세 본문 카드
 * 모바일 SVG: card 343 / 데스크톱 Figma: card 800 고정
 */
export const REVIEW_DETAIL_BODY = {
  root: "relative mt-[40px] w-full overflow-visible sm:mt-[50px] sm:w-[800px]",
  shell: `relative w-full overflow-visible sm:w-[800px] ${REVIEW_CARD_SHELL_CLASS}`,

  /**
   * 모바일 — 카드 좌상단에 걸침 (top -24)
   * 테두리는 border 대신 0 0 0 1px 링 — 본문 카드 셸과 동일 방식
   */
  rating: {
    box: "absolute z-10 box-border flex flex-col items-center justify-center rounded-[15px] bg-white pt-1 left-0 top-[-24px] h-[75px] w-[75px] sm:left-[-23px] sm:top-[-20px] sm:h-[131px] sm:w-[131px]",
    label:
      "shrink-0 text-center text-[12px] font-bold leading-[14px] tracking-[0.05em] sm:text-[24px] sm:leading-[29px]",
    score:
      "flex h-[33px] w-[65px] shrink-0 items-center justify-center text-center text-[32px] font-bold leading-none sm:h-[66px] sm:w-[97px] sm:text-[64px] sm:leading-[76px]",
  },

  /**
   * 모바일 — X·타이포는 Figma, Y는 구분선 위(h 51) 세로 중앙
   * inset left 86 · right 22
   */
  author: {
    root: "relative h-[51px] sm:hidden",
    row: "absolute inset-x-0 top-0 flex h-[51px] items-center justify-between gap-2 pl-[86px] pr-[22px]",
    identity: "flex min-w-0 items-center gap-[6px]",
    meta: "min-w-0",
    nickname:
      "block truncate text-[12px] font-medium leading-[14px] text-black hover:underline",
    date: "mt-[2px] block text-[10px] font-normal leading-[12px] text-[#D9D9D9]",
    actions: "flex shrink-0 items-center gap-0",
    divider:
      "absolute left-[86px] right-[22px] top-[51px] h-px bg-[#D9D9D9]",
  },

  /**
   * 데스크톱 — 800 기준 absolute
   * left 131 · width 619 (= 800 − 131 − 50)
   */
  desktopAuthor: {
    root: "absolute left-[131px] top-0 z-[1] hidden h-[111px] w-[619px] min-w-0 items-center justify-between gap-[14px] sm:flex",
    identity: "flex min-w-0 items-center gap-[10px]",
    meta: "min-w-0",
    nickname:
      "block truncate text-[20px] font-medium leading-[24px] text-black hover:underline",
    date: "mt-[2px] block text-[11px] font-normal leading-[13px] text-[#D9D9D9]",
    actions: "flex shrink-0 items-center gap-0",
    divider:
      "absolute left-[131px] top-[111px] hidden h-px w-[619px] bg-[#D9D9D9] sm:block",
  },

  content:
    "px-[28px] pb-6 pt-5 text-[14px] font-normal leading-[200%] text-black sm:px-[50px] sm:pb-[40px] sm:pt-[157px]",
  reject:
    "mx-4 mb-6 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-900 sm:mx-[50px]",

  ownerAction: {
    mobile:
      "inline-flex w-[21px] items-center justify-end text-right text-[10px] font-normal leading-[12px] text-[#D9D9D9] transition-colors hover:text-[var(--color-brand-primary)]",
    desktop:
      "inline-flex w-[31px] items-center justify-end text-right text-[14px] font-normal leading-[17px] text-[#D9D9D9] transition-colors hover:text-[var(--color-brand-primary)]",
  },

  avatar: {
    mobile: "h-[26px] w-[26px]",
    desktop: "h-10 w-10",
  },
} as const;
