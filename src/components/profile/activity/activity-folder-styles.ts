/** My Reviews / My Favorite / My Playlist · 활동 통계 레이아웃 */

import { PROFILE_CLUSTER_ABSOLUTE_CLASS } from "../profile-section-styles";

export const ACTIVITY_FOLDER_WIDTH = 266;
export const ACTIVITY_FOLDER_HEIGHT = 282;

/** 폴더·통계 공통 3열 — 가운데 열 중심 = 섹션 중심 · 320×3 + gap 13 = 986 */
const ACTIVITY_DESKTOP_GRID_CLASS = `${PROFILE_CLUSTER_ABSOLUTE_CLASS} lg:grid lg:grid-cols-3 lg:items-start lg:justify-items-center lg:gap-x-[13px]`;

const ACTIVITY_FOLDER_SIZE_CLASS = "h-[282px] w-[266px] shrink-0";

/** 모바일도 Figma 풀사이즈 · 1열 / lg 이상 가로 3열 */
export const ACTIVITY_FOLDER_SHELL_CLASS = `relative mx-auto block ${ACTIVITY_FOLDER_SIZE_CLASS}`;

export const ACTIVITY_FOLDER_SCALE_CLASS =
  "absolute left-0 top-0 origin-top-left scale-100";

export const ACTIVITY_PRIVATE_PLACEHOLDER_CLASS = `mx-auto flex ${ACTIVITY_FOLDER_SIZE_CLASS} items-center justify-center rounded-[15px] border border-[#D9D9D9] bg-white p-5`;

export const ACTIVITY_COLLECTION_GRID_CLASS =
  "flex flex-col items-center gap-6 lg:flex-row lg:flex-wrap lg:justify-center lg:gap-[46px]";

export const ACTIVITY_OWNER_COLLECTION_GRID_CLASS = `mt-8 flex w-full flex-col items-center gap-6 lg:top-[117px] lg:mt-0 ${ACTIVITY_DESKTOP_GRID_CLASS}`;

export const ACTIVITY_STATS_GRID_CLASS = `mt-8 flex w-full flex-row items-stretch justify-center gap-2 pb-8 sm:gap-[13px] lg:bottom-[24px] lg:mt-0 lg:pb-0 ${ACTIVITY_DESKTOP_GRID_CLASS}`;

/** 모바일 flex-1 · 데스크톱 그리드 열(320) 채움 */
export const ACTIVITY_STAT_SHELL_CLASS =
  "min-w-0 flex-1 lg:w-full lg:max-w-[320px] lg:flex-none";
