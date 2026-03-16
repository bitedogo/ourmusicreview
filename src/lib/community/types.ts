export interface NoticeCategoryMap {
  RELEASE_NOTE: "RELEASE_NOTE";
  EVENT: "EVENT";
  SERVICE: "SERVICE";
  REPORT: "REPORT";
}

export type NoticeCategory = keyof NoticeCategoryMap;
