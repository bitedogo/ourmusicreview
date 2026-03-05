import { NoticeCategory } from "@/src/lib/db/entities/Post";

export const NOTICE_CATEGORY_VALUES: NoticeCategory[] = [
  "RELEASE_NOTE",
  "EVENT",
  "SERVICE",
  "REPORT",
];

export const NOTICE_CATEGORY_LABEL: Record<NoticeCategory, string> = {
  RELEASE_NOTE: "RELEASE NOTE",
  EVENT: "EVENT",
  SERVICE: "SERVICE",
  REPORT: "REPORT",
};

export const NOTICE_CATEGORY_COLOR: Record<NoticeCategory, string> = {
  RELEASE_NOTE: "text-red-600",
  EVENT: "text-blue-600",
  SERVICE: "text-emerald-600",
  REPORT: "text-purple-600",
};

export const NOTICE_CATEGORY_OPTIONS: Array<{
  value: NoticeCategory;
  label: string;
}> = NOTICE_CATEGORY_VALUES.map((value) => ({
  value,
  label: NOTICE_CATEGORY_LABEL[value],
}));

export function isNoticeCategory(value: unknown): value is NoticeCategory {
  return typeof value === "string" && NOTICE_CATEGORY_VALUES.includes(value as NoticeCategory);
}
