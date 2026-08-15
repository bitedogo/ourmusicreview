/** 오늘의 앨범 카드·그리드 클래스 */

export const TODAY_ALBUM_ARTICLE_BASE =
  "relative z-0 -mt-px rounded-b-[var(--featured-cover-radius)] border border-[var(--color-border)] sm:w-[var(--today-album-card-width)] sm:max-w-full sm:rounded-tr-[var(--featured-cover-radius)]";

export const TODAY_ALBUM_ARTICLE_PREVIOUS =
  "h-[min(70vh,var(--today-album-card-height))] overflow-hidden bg-[#FEFEFE] p-0 sm:h-[var(--today-album-card-height)]";

export const TODAY_ALBUM_ARTICLE_DETAIL =
  "bg-white px-[var(--today-album-content-padding-x-mobile)] py-[var(--today-album-content-padding-y-mobile)] sm:h-[var(--today-album-card-height)] sm:px-[var(--today-album-content-padding-x-desktop)] sm:py-[var(--today-album-content-padding-y-desktop)]";

export const PREVIOUS_CELL_CLASS =
  "relative box-border block h-[72px] w-[72px] shrink-0 overflow-hidden rounded-[10px] border border-[#D9D9D9] bg-[#505050] sm:h-[var(--today-album-previous-cell)] sm:w-[var(--today-album-previous-cell)]";

export const PREVIOUS_GRID_CLASS =
  "flex flex-wrap content-start items-start gap-[12px] px-4 pb-8 pt-5 sm:gap-[var(--today-album-previous-gap)] sm:pb-[var(--today-album-previous-padding-bottom)] sm:pl-[var(--today-album-previous-padding-left)] sm:pr-[var(--today-album-previous-padding-right)] sm:pt-[var(--today-album-previous-padding-top)]";
