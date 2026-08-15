/** 프로필 섹션 — 카드 1100 · inset 27 · 묶음 986 */

export const PROFILE_SECTION_CARD =
  "relative mx-auto box-border w-full max-w-[1100px] overflow-hidden rounded-[15px] border border-[#D9D9D9] bg-white shadow-[0px_2px_4px_rgba(0,0,0,0.25)]";

export const PROFILE_SECTION_INSET = "px-4 sm:px-6 lg:px-[27px]";

export const PROFILE_SECTION_TITLE =
  "text-[15px] font-normal leading-[18px] text-[var(--color-text-primary)]";

/** 제목·i — 구분선보다 안쪽으로 */
export const PROFILE_SECTION_TITLE_INSET = "pl-3 lg:pl-4";

/** 공개 토글 우측 = Masterpiece 구분선 끝 */
export const PROFILE_PRIVACY_TOGGLE_RIGHT_CLASS =
  "right-4 sm:right-6 lg:right-[27px]";

export const PROFILE_SECTION_DIVIDER = "mb-8 h-px w-full bg-[#E3E3E3]";

/** 활동·Masterpiece·폴더 공통 폭 986 */
const PROFILE_CLUSTER_WIDTH_CLASS = "lg:w-[986px] lg:max-w-full";

/** Masterpiece 앨범 묶음 */
export const PROFILE_CLUSTER_BAND_CLASS = `w-full lg:mx-auto ${PROFILE_CLUSTER_WIDTH_CLASS}`;

/** 활동 폴더·통계 — 섹션 중앙 */
export const PROFILE_CLUSTER_ABSOLUTE_CLASS = `lg:absolute lg:left-1/2 lg:-translate-x-1/2 ${PROFILE_CLUSTER_WIDTH_CLASS}`;
export const PROFILE_PAGE_SHELL_CLASS =
  "mx-auto w-full max-w-[1100px] px-3 pb-6 pt-[var(--profile-menu-title-gap)] sm:px-6 sm:pb-8 lg:px-0";

export const PROFILE_HEADER_CARD_CLASS = `${PROFILE_SECTION_CARD} max-lg:bg-[#FEFEFE] max-lg:shadow-[0px_3px_3px_rgba(0,0,0,0.25)]`;

export const PROFILE_OWNER_ACTIVITY_SECTION_CLASS = `${PROFILE_SECTION_CARD} !overflow-visible pt-10 ${PROFILE_SECTION_INSET} lg:relative lg:h-[530px] lg:pb-0`;

export const PROFILE_EMBEDDED_SECTION_CLASS = `${PROFILE_SECTION_CARD} !overflow-visible pb-10 pt-10 ${PROFILE_SECTION_INSET}`;

export const MASTERPIECE_GRID =
  "grid grid-cols-3 justify-items-stretch gap-x-2 gap-y-6 lg:grid-cols-6 lg:gap-x-3";

export const MASTERPIECE_GRID_COL_WIDTH =
  "w-[calc((100%-1rem)/3)] lg:w-[calc((100%-3.75rem)/6)]";

export const MASTERPIECE_EDIT_BUTTON_CLASS =
  "box-border flex h-[25px] w-[38px] items-center justify-center rounded-[5px] border border-[#D9D9D9] text-[9px] leading-[11px] transition lg:h-[35px] lg:w-[55px] lg:rounded-[10px] lg:text-[13px] lg:leading-4";
