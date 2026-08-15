/** 오늘의 앨범 카드·Previous 그리드 치수 (CSS var와 동일) */

export const TODAY_ALBUM_CARD = {
  width: 1098,
  height: 529,
} as const;

export const PREVIOUS_GRID = {
  columns: 7,
  cell: 120,
  gap: 28,
  paddingTop: 30,
  paddingLeft: 35,
  paddingBottom: 78,
  coverScrollbarGap: 30,
  mobileColumns: 4,
  mobileGap: 12,
} as const;

/** 1098 박스, 7열 120 + 갭 28 + 왼쪽 35 + 커버↔바 30 기준 */
export const PREVIOUS_SCROLLBAR = {
  width: 6,
  height: 420,
  top: 54.5,
  right: 17,
} as const;
