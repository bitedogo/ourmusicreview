/** 리뷰 상세 댓글 — Figma 스타일·간격 상수 */

export const COMMENT_DETAIL_DATE = {
  widthPx: 100,
  contentGapPx: 27,
  desktopPaddingRightPx: 127,
  lineHeightPx: 28,
} as const;

export const COMMENT_DETAIL_CLASS = {
  article:
    "flex gap-[9px] overflow-visible border-b border-[#D9D9D9] pb-[10px]",
  replyIndent: "ml-[43px]",
  nickname:
    "min-w-0 truncate text-[16px] font-medium leading-[19px] text-[#505050] hover:underline",
  nicknameRow:
    "mt-[9px] flex min-w-0 items-center gap-[8px] sm:block",
  mobileDate:
    "shrink-0 text-[12px] font-normal leading-[14px] text-[#C4C4C4] sm:hidden",
  contentWrap: "relative mt-[3px] min-h-[28px]",
  content:
    "max-w-[542px] min-w-0 whitespace-pre-wrap text-[14px] font-normal leading-[200%] text-[#505050] sm:max-w-none sm:pr-[127px]",
  desktopDate:
    "absolute bottom-0 right-0 hidden h-[28px] w-[100px] items-center justify-end text-right text-[12px] font-normal leading-[14px] text-[#C4C4C4] sm:flex",
  actionsRow:
    "mt-[7px] flex min-h-[15px] items-end justify-between overflow-visible",
  action:
    "shrink-0 text-[12px] font-normal leading-[14px] text-[#C4C4C4] transition hover:text-[#505050]",
  ownerActions: "inline-flex items-center gap-[7px]",
  editTextarea:
    "w-full resize-none rounded-[10px] border border-[#D9D9D9] bg-white px-3 py-2 text-[14px] leading-[200%] text-[#505050] outline-none focus:border-zinc-400",
  saveButton:
    "text-[12px] font-normal leading-[14px] text-[#505050] transition hover:opacity-70 disabled:opacity-40",
  list: "mt-[37px] [&>div+div]:mt-[37px] [&>div:last-child>article]:border-b-0",
  replyList: "mt-[37px] space-y-0 [&>div+div]:mt-[37px]",
  listOffset: "mt-[37px]",
  empty: "py-8 text-center text-[14px] leading-[200%] text-[#C4C4C4]",
  detailIcon: "block shrink-0 overflow-visible",
  interactionBar:
    "inline-flex min-h-[15px] items-center gap-[12px] overflow-visible",
  interactionButton:
    "inline-flex min-h-[15px] items-center gap-[4px] overflow-visible p-0 transition hover:opacity-70",
  interactionCount: "text-[12px] font-medium leading-[15px] text-[#515151]",
  reportButton:
    "inline-flex min-h-[15px] w-[15.6px] shrink-0 items-center justify-center overflow-visible p-0 transition hover:opacity-70",
} as const;
