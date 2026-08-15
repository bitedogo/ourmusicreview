/** 오늘의 앨범 카드·그리드 클래스 */

export const TODAY_ALBUM_SHELL =
  "relative mt-[calc(var(--featured-slider-today-album-gap)-var(--masterpiece-slider-pad-y))] w-full sm:-mx-[var(--page-padding-x-desktop)]";

export const TODAY_ALBUM_SHELL_INNER =
  "mx-auto w-full sm:w-[var(--today-album-card-width)] sm:min-w-[var(--today-album-card-width)] sm:max-w-[var(--today-album-card-width)]";

export const TODAY_ALBUM_ARTICLE_BASE =
  "relative z-0 -mt-px w-full rounded-b-[var(--featured-cover-radius)] border border-[var(--color-border)] sm:rounded-tr-[var(--featured-cover-radius)]";

export const TODAY_ALBUM_ARTICLE_PREVIOUS =
  "h-[min(70vh,var(--today-album-card-height))] overflow-hidden bg-[#FEFEFE] p-0 sm:h-[var(--today-album-card-height)]";

export const TODAY_ALBUM_ARTICLE_DETAIL =
  "bg-white px-[var(--today-album-content-padding-x-mobile)] py-[var(--today-album-content-padding-y-mobile)] sm:h-[var(--today-album-card-height)] sm:px-[var(--today-album-content-padding-x-desktop)] sm:py-[var(--today-album-content-padding-y-desktop)]";

export const TODAY_ALBUM_TITLE_CLASS =
  "mb-[var(--today-album-title-content-gap)] flex items-center justify-center text-center text-[20px] font-semibold leading-[145%] tracking-[-0.005em] text-[#43A7B2]";

export const TODAY_ALBUM_EMPTY_CLASS =
  "py-[var(--today-album-section-margin-top)] text-center text-[length:var(--text-today-album-empty)] text-[var(--color-text-muted)]";

export const TODAY_ALBUM_DETAIL_ROW =
  "flex flex-col items-center gap-[var(--today-album-layout-gap-mobile)] sm:h-full sm:flex-row sm:items-center sm:gap-[var(--today-album-layout-gap-desktop)]";

export const PREVIOUS_CELL_CLASS =
  "relative block aspect-square w-full overflow-hidden rounded-[10px] bg-[#505050] shadow-[0_0_0_1px_#D9D9D9] sm:aspect-auto sm:h-[var(--today-album-previous-cell)] sm:w-[var(--today-album-previous-cell)]";

export const PREVIOUS_GRID_CLASS =
  "mx-auto grid w-full grid-cols-4 justify-items-stretch gap-[12px] px-4 pb-8 pt-5 sm:mx-0 sm:grid-cols-[repeat(7,var(--today-album-previous-cell))] sm:justify-items-start sm:gap-[var(--today-album-previous-gap)] sm:px-0 sm:pb-[var(--today-album-previous-padding-bottom)] sm:pl-[var(--today-album-previous-padding-left)] sm:pr-0 sm:pt-[var(--today-album-previous-padding-top)]";

export const PREVIOUS_DATE_CLASS =
  "pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-1 text-center text-[14px] font-normal leading-[29px] text-[#FEFEFE] [text-shadow:0_1px_2px_rgba(0,0,0,0.65)] sm:text-[24px]";
