/** 리뷰 상세 — Frame 117(행) + Frame 268–270(pill) */

export const REVIEW_DETAIL_INTERACTION_CLASS = {
  /** 위·아래 간격은 페이지 래퍼(pt/pb)에서 제어 */
  root: "flex w-full shrink-0 flex-row flex-wrap items-center justify-center gap-2 overflow-visible sm:gap-[14px]",
  pill: "box-border inline-flex h-[30px] shrink-0 flex-none items-center justify-center overflow-visible whitespace-nowrap rounded-[23px] border-[1.5px] border-[#D9D9D9] bg-white transition hover:bg-zinc-50 sm:h-[46px] sm:rounded-[175px] sm:border-[1.75px]",
  label:
    "inline-flex shrink-0 items-center text-[10px] font-medium leading-[12px] text-[#515151] sm:h-[19px] sm:text-[16px] sm:leading-[19px]",
  row: "inline-flex h-[12px] flex-nowrap overflow-visible sm:h-[19px]",
  likeRow: "items-end gap-1 sm:gap-1.5",
  shareRow: "items-start gap-2 sm:gap-3",
  reportRow: "items-center gap-2 sm:gap-3",
  likeButton: "min-w-[91px] px-3 sm:min-w-[140px] sm:px-7",
  shareButton: "min-w-[72px] px-3 sm:min-w-[110px] sm:pl-[27px] sm:pr-[26px]",
  reportButton: "min-w-[72px] px-3 sm:min-w-[110px] sm:pl-[25px] sm:pr-6",
  reportIcon:
    "h-[11.74px] w-[12.21px] sm:mt-[0.5px] sm:h-[18px] sm:w-[19px]",
  detailIcon: "block shrink-0 overflow-visible",
} as const;
