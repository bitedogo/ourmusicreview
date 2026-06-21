/**
 * px 단위 디자인 토큰.
 * `app/globals.css` `:root` 변수와 값을 맞춰 유지합니다.
 */

export const LAYOUT = {
  contentMaxWidth: 1100,
  searchBarMaxWidth: 700,
  headerSearchGap: 24,
  pagePaddingXMobile: 24,
  pagePaddingXDesktop: 40,
  sitePaddingXMobile: 16,
} as const;

export const LOGO = {
  width: 141,
  height: 72.9,
} as const;

export const SEARCH_BAR = {
  maxWidth: 700,
  heightMobile: 56,
  heightDesktop: 65,
  buttonHeightMobile: 44,
  buttonHeightDesktop: 51,
  buttonPaddingXMobile: 20,
  buttonPaddingXDesktop: 28,
  radiusOpenTop: 32,
  inputPaddingLeftMobile: 8,
  inputPaddingLeftDesktop: 12,
  trackPaddingXMobile: 8,
  trackPaddingXDesktop: 12,
  trackGapMobile: 8,
  trackGapDesktop: 12,
} as const;

export const FEATURED_CARD = {
  widthMobile: 192,
  widthDesktop: 224,
  marginX: 12,
  padding: 16,
  gap: 12,
  innerGap: 8,
  radius: 15,
  coverRadius: 15,
  titleSize: 16,
  metaSize: 10,
  ratingSize: 14,
  ratingDividerPaddingTop: 8,
  ratingDividerPaddingBottom: 4,
} as const;

export const FEATURED_TRACK = {
  marginTop: 6,
  paddingY: 16,
  animationDuration: 72,
} as const;

export const TODAY_ALBUM = {
  coverSize: 320,
  sectionMarginTop: 40,
  contentPaddingXMobile: 20,
  contentPaddingXDesktop: 32,
  contentPaddingYMobile: 24,
  contentPaddingYDesktop: 32,
  layoutGapMobile: 20,
  layoutGapDesktop: 40,
  titleSize: 24,
  bodySizeMobile: 14,
  bodySizeDesktop: 15,
  titleLineHeight: 1.45,
  bodyLineHeight: 1.7,
  letterSpacing: 0.03,
  descriptionMaxHeight: 320,
  emptyStateSize: 14,
} as const;

export const HERO = {
  copyMarginTopMobile: 40,
  copyMarginTopDesktop: 48,
  titleSizeMobile: 32,
  titleSizeDesktop: 40,
  subtitleSizeMobile: 14,
  subtitleSizeDesktop: 16,
  subtitleLineHeight: 1.75,
  sectionPaddingBottomMobile: 32,
  sectionPaddingBottomDesktop: 48,
} as const;

/** @deprecated LAYOUT.contentMaxWidth 사용 */
export const HOME_CONTENT_MAX_WIDTH = LAYOUT.contentMaxWidth;

/** @deprecated SEARCH_BAR.maxWidth 사용 */
export const SEARCH_BAR_MAX_WIDTH = SEARCH_BAR.maxWidth;

/** @deprecated LAYOUT.headerSearchGap 사용 */
export const HEADER_SEARCH_GAP = LAYOUT.headerSearchGap;

/** @deprecated TODAY_ALBUM.coverSize 사용 */
export const TODAY_ALBUM_COVER_SIZE = TODAY_ALBUM.coverSize;

export const PAGE_PADDING_X = "px-[var(--page-padding-x-mobile)] sm:px-[var(--page-padding-x-desktop)]";

export const SITE_CONTAINER_PADDING_X =
  "px-[var(--site-padding-x-mobile)] sm:px-0";

export const SITE_DIVIDER_CLASS = "border-[var(--color-divider)]";
