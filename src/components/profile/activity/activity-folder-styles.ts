/** My Reviews / My Favorite / My Playlist · 활동 통계 레이아웃 */

import { PROFILE_CONTENT_BAND_CLASS } from "../profile-section-styles";

export const ACTIVITY_FOLDER_WIDTH = 266;
export const ACTIVITY_FOLDER_HEIGHT = 282;

/** 모바일도 Figma 풀사이즈 · 1열 / lg 이상 가로 3열 */
export const ACTIVITY_FOLDER_SHELL_CLASS =
  "relative mx-auto block h-[282px] w-[266px] shrink-0";

export const ACTIVITY_FOLDER_SCALE_CLASS =
  "absolute left-0 top-0 origin-top-left scale-100";

export const ACTIVITY_PRIVATE_PLACEHOLDER_CLASS =
  "mx-auto flex h-[282px] w-[266px] shrink-0 items-center justify-center rounded-[15px] border border-[#D9D9D9] bg-white p-5";

export const ACTIVITY_COLLECTION_GRID_CLASS =
  "flex flex-col items-center gap-6 lg:flex-row lg:flex-wrap lg:justify-center lg:gap-[46px]";

export const ACTIVITY_OWNER_COLLECTION_GRID_CLASS = `mt-8 flex w-full flex-col items-center gap-6 lg:absolute lg:top-[117px] lg:mt-0 lg:flex-row lg:flex-wrap lg:justify-center lg:gap-[46px] lg:p-[5px] ${PROFILE_CONTENT_BAND_CLASS}`;

/** Figma 320×3 + gap 13 = 986 · absolute 가운데 */
export const ACTIVITY_STATS_GRID_CLASS =
  "mt-8 flex w-full flex-row items-stretch justify-center gap-2 pb-8 sm:gap-[13px] lg:absolute lg:bottom-[24px] lg:left-1/2 lg:mt-0 lg:w-[986px] lg:max-w-full lg:-translate-x-1/2 lg:gap-[13px] lg:px-0 lg:pb-0";
