/** My Reviews / My Favorite · 활동 통계 레이아웃 */

import { PROFILE_CONTENT_BAND_CLASS } from "../profile-section-styles";

export const ACTIVITY_FOLDER_WIDTH = 266;
export const ACTIVITY_FOLDER_HEIGHT = 282;

export const ACTIVITY_FOLDER_SHELL_CLASS =
  "relative block h-[155px] w-[146px] shrink-0 max-[359px]:h-[133px] max-[359px]:w-[125px] lg:h-[282px] lg:w-[266px]";

export const ACTIVITY_FOLDER_SCALE_CLASS =
  "absolute left-0 top-0 origin-top-left scale-[0.55] max-[359px]:scale-[0.47] lg:scale-100";

export const ACTIVITY_PRIVATE_PLACEHOLDER_CLASS =
  "flex h-[155px] w-[146px] shrink-0 items-center justify-center rounded-[15px] border border-[#D9D9D9] bg-white p-3 max-[359px]:h-[133px] max-[359px]:w-[125px] lg:h-[282px] lg:w-[266px] lg:p-5";

export const ACTIVITY_COLLECTION_GRID_CLASS =
  "flex flex-row flex-nowrap items-start justify-center gap-3 lg:flex-wrap lg:gap-[46px]";

export const ACTIVITY_OWNER_COLLECTION_GRID_CLASS = `mt-8 flex w-full flex-row flex-nowrap items-start justify-center gap-3 lg:absolute lg:top-[117px] lg:mt-0 lg:gap-[46px] lg:p-[5px] ${PROFILE_CONTENT_BAND_CLASS}`;

/** Figma 320×3 + gap 13 = 986 · absolute 가운데 */
export const ACTIVITY_STATS_GRID_CLASS =
  "mt-8 flex w-full flex-row items-stretch justify-center gap-2 pb-8 sm:gap-[13px] lg:absolute lg:bottom-[24px] lg:left-1/2 lg:mt-0 lg:w-[986px] lg:max-w-full lg:-translate-x-1/2 lg:gap-[13px] lg:px-0 lg:pb-0";
