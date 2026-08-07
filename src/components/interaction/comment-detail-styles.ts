/** 리뷰·플레이리스트 상세 댓글 — Figma 토큰 / Tailwind 클래스 */

/** Frame 278 · 댓글 행 수치 (모바일 기준, px) */
export const COMMENT_DETAIL = {
  avatar: 22.21,
  avatarDesktop: 34,
  avatarGap: 5.08,
  avatarGapDesktop: 9,
  nicknameLeading: 17,
  nicknameDesktopLeading: 19,
  nicknameDateGap: 6.97,
  contentMinHeight: 28,
  contentToNickname: 4,
  contentToActions: 12,
  listAfterForm: 37,
  listGap: 20,
  listGapDesktop: 37,
  replyIndent: 27.29,
  replyIndentDesktop: 43,
  cardPaddingBottom: 22,
  cardPaddingBottomDesktop: 36,
  cardPaddingXDesktop: 44,
  cardPaddingTopDesktop: 36,
  sectionMarginTop: 40,
  sectionMarginTopDesktop: 30,
  formAfterTitle: 22,
  formAfterTitleDesktop: 18,
  desktopDateWidth: 100,
  desktopContentPadRight: 127,
} as const;

/** 작성/답글 폼 공통 (모바일 Frame 278) — 클래스는 정적 문자열 유지 (Tailwind 스캔) */
export const COMMENT_DETAIL_FORM_CLASS = {
  wrap: "mt-[22px] sm:mt-[18px]",
  replyWrap: "mt-3",
  box: "relative box-border h-[62px] w-full rounded-[10px] border-[1.2px] border-[#D9D9D9] bg-white sm:border-[1.75px]",
  input:
    "absolute left-[9px] top-0 h-[28px] w-[calc(100%-70px)] resize-none overflow-hidden border-0 bg-transparent p-0 text-[12px] font-normal leading-[28px] text-[#505050] outline-none placeholder:text-[12px] placeholder:font-normal placeholder:text-[#D9D9D9] focus:ring-0 sm:left-[21px] sm:top-[6px] sm:w-[calc(100%-120px)] sm:leading-[200%]",
  submit:
    "absolute right-[4.55px] top-[39px] box-border flex h-[18px] w-[52.06px] items-center justify-center rounded-[5px] bg-[#D9D9D9] text-[10px] font-normal leading-[13px] text-white transition hover:bg-[#c8c8c8] disabled:cursor-not-allowed disabled:opacity-60 sm:bottom-[5px] sm:right-[5px] sm:top-auto sm:h-[30px] sm:w-[86px] sm:text-[14px] sm:leading-[200%]",
} as const;

export const COMMENT_DETAIL_CLASS = {
  section: "mt-[40px] scroll-mt-8 sm:mt-[30px]",
  card: "w-full rounded-[15px] border border-[#D9D9D9] bg-white px-5 pb-[22px] pt-7 shadow-[0px_2px_4px_rgba(0,0,0,0.25)] sm:px-[44px] sm:pb-[36px] sm:pt-[36px]",
  titleRow: "flex items-end gap-1",
  title:
    "text-[12px] font-normal leading-[15px] text-[#505050] sm:text-[16px] sm:leading-[19px]",
  titleCount:
    "text-[12px] font-normal leading-[15px] text-[#D9D9D9] sm:text-[16px] sm:leading-[19px]",
  pagination:
    "flex items-center justify-end gap-2 py-3 text-[12px] font-normal leading-[14px] text-[#C4C4C4]",
  paginationActive: "text-[#505050]",

  article:
    "flex items-start gap-[5.08px] overflow-visible border-b border-[#D9D9D9] pb-[10px] sm:gap-[9px]",
  replyIndent: "ml-[27.29px] sm:ml-[43px]",
  avatar:
    "mt-[calc((17px-22.21px)/2)] shrink-0 sm:mt-[calc((19px-34px)/2)]",
  body: "min-w-0 flex-1",
  nickname:
    "w-fit max-w-full min-w-0 truncate text-[14px] font-medium leading-[17px] text-[#505050] hover:underline sm:text-[16px] sm:leading-[19px]",
  nicknameRow:
    "flex min-w-0 flex-nowrap items-end gap-x-[6.97px] sm:block",
  mobileDate:
    "shrink-0 text-[12px] font-normal leading-[14px] text-[#C4C4C4] sm:hidden",
  contentWrap: "relative mt-[4px] min-h-[28px] sm:mt-[3px]",
  content:
    "min-w-0 whitespace-pre-wrap text-[12px] font-normal leading-[200%] text-[#505050] sm:pr-[127px] sm:text-[14px]",
  desktopDate:
    "absolute bottom-0 right-0 hidden h-[28px] w-[100px] items-center justify-end text-right text-[12px] font-normal leading-[14px] text-[#C4C4C4] sm:flex",
  actionsRow:
    "mt-[12px] flex min-h-[15px] items-center justify-between gap-2 overflow-visible sm:mt-[7px]",
  action:
    "shrink-0 text-[10px] font-normal leading-[12px] text-[#C4C4C4] transition hover:text-[#505050] sm:text-[12px] sm:leading-[14px]",
  ownerActions: "inline-flex shrink-0 items-center gap-1 sm:gap-[7px]",
  editWrap: "mt-[4px] space-y-2 sm:mt-[3px]",
  editActions: "flex justify-end gap-[7px]",
  editTextarea:
    "w-full resize-none rounded-[10px] border border-[#D9D9D9] bg-white px-3 py-2 text-[12px] leading-[200%] text-[#505050] outline-none focus:border-zinc-400 sm:text-[14px]",
  saveButton:
    "text-[10px] font-normal leading-[12px] text-[#505050] transition hover:opacity-70 disabled:opacity-40 sm:text-[12px] sm:leading-[14px]",
  list: "mt-[37px] [&>div+div]:mt-[20px] [&>div:last-child>article]:border-b-0 [&>div:last-child>article]:pb-0 sm:[&>div+div]:mt-[37px]",
  replyList:
    "mt-[20px] space-y-0 [&>div+div]:mt-[20px] sm:mt-[37px] sm:[&>div+div]:mt-[37px]",
  listOffset: "mt-[37px]",
  empty:
    "py-8 text-center text-[12px] leading-[200%] text-[#C4C4C4] sm:text-[14px]",
  detailIcon: "block shrink-0 overflow-visible",
  interactionBar:
    "inline-flex h-[15px] min-h-[15px] items-center gap-[12px] overflow-visible",
  interactionButton:
    "inline-flex h-[15px] min-h-[15px] items-center gap-[4px] overflow-visible p-0 transition hover:opacity-70",
  interactionCount: "text-[12px] font-medium leading-[15px] text-[#515151]",
  reportButton:
    "inline-flex h-[15px] min-h-[15px] w-[15.6px] shrink-0 items-center justify-center overflow-visible p-0 transition hover:opacity-70",
} as const;
