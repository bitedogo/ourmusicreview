/** 리뷰 상세 — 추천·공유·신고 pill 버튼 (Figma Frame 268–270) */

export const REVIEW_DETAIL_INTERACTION_CLASS = {
  root: "flex flex-wrap items-center justify-center gap-2 overflow-visible pt-[10px] sm:gap-[14px] sm:py-6 sm:pt-6",
  pill: "box-border inline-flex h-[30px] shrink-0 items-center justify-center overflow-visible whitespace-nowrap rounded-[23px] border border-[#D9D9D9] bg-white transition hover:bg-zinc-50 sm:h-[46px] sm:rounded-[175px] sm:border-[1.75px]",
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
