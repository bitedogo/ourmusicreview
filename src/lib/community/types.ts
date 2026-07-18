/** 커뮤니티 게시글·게시판 타입 */

export interface NoticeCategoryMap {
  RELEASE_NOTE: "RELEASE_NOTE";
  EVENT: "EVENT";
  SERVICE: "SERVICE";
  REPORT: "REPORT";
}

export type NoticeCategory = keyof NoticeCategoryMap;
