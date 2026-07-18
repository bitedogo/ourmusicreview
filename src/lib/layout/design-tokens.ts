
/** 레이아웃·간격 디자인 토큰 */

export const LAYOUT = {
  contentMaxWidth: 1100,
  headerSearchGap: 24,
  logoMenuGap: 61,
  pagePaddingXMobile: 24,
  pagePaddingXDesktop: 40,
  sitePaddingXMobile: 16,
} as const;

export const NAV = {
  menuFontSize: 18,
} as const;

export const LOGO = {
  width: 141,
  height: 72.9,
  paddingTop: 35,
} as const;

export const SEARCH_BAR = {
  maxWidth: 667,
  heightMobile: 57,
  heightDesktop: 57,
  buttonWidth: 117,
  buttonWidthMobile: 100,
  buttonHeight: 41,
  trackInset: 8,
  radius: 15,
  radiusOpenTop: 15,
  inputPaddingLeftMobile: 8,
  inputPaddingLeftDesktop: 12,
  trackPaddingXMobile: 8,
  trackPaddingXDesktop: 12,
  trackGapMobile: 8,
  trackGapDesktop: 12,
  inputFontSize: 16,
} as const;

export const FEATURED_CARD = {
  widthMobile: 224,
  widthDesktop: 224,
  height: 326,
  coverSize: 224,
  marginX: 12,
  padding: 16,
  gap: 12,
  titleArtistGap: 4,
  innerGap: 8,
  radius: 15,
  slideCardRadius: 24,
  coverRadius: 15,
  titleSize: 15,
  artistSize: 13,
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

export const HOME_SECTION = {
  titleSubtitleGap: 22,
  subtitleMasterpieceGap: 101,
  masterpieceSliderGap: 45,
  masterpieceSliderPadY: 16,
  sliderTodayAlbumGap: 101,
  todayAlbumTitleContentGap: 45,
  todayAlbumChartGap: 101,
  chartTitleContentGap: 45,
} as const;

export const TODAY_ALBUM = {
  cardWidth: 1099,
  cardHeight: 529,
  coverSize: 449.58,
  sectionMarginTop: 40,
  contentPaddingXMobile: 20,
  contentPaddingXDesktop: 32,
  contentPaddingYMobile: 24,
  contentPaddingYDesktop: 32,
  layoutGapMobile: 20,
  layoutGapDesktop: 40,
  titleSize: 25,
  artistSize: 18,
  descOffsetTop: 16,
  bodySizeMobile: 14,
  bodySizeDesktop: 15,
  titleLineHeight: 1.45,
  bodyLineHeight: 1.7,
  letterSpacing: 0.03,
  descriptionMaxHeight: 355,
  emptyStateSize: 14,
} as const;

export const HERO = {
  searchCopyGap: 65,
  copyMarginTopMobile: 40,
  copyMarginTopDesktop: 48,
  titleSizeMobile: 22,
  titleSizeDesktop: 40,
  subtitleSizeMobile: 16,
  subtitleSizeDesktop: 20,
  subtitleLineHeight: 1.75,
  sectionPaddingBottomMobile: 32,
  sectionPaddingBottomDesktop: 48,
  stickyHeight: 139,
  stickyPaddingTop: 16,
  stickyPaddingBottom: 16,
  stickyNavSearchGap: 43,
} as const;

export const PAGE_PADDING_X = "px-[var(--page-padding-x-mobile)] sm:px-[var(--page-padding-x-desktop)]";

export const SITE_CONTAINER_PADDING_X =
  "px-[var(--site-padding-x-mobile)] sm:px-0";
