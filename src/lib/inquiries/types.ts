/** 1:1 문의 유형·상태 */

export const INQUIRY_CATEGORIES = [
  { value: "ACCOUNT", label: "계정", hint: "로그인·닉네임" },
  { value: "PAYMENT", label: "결제", hint: "결제·환불" },
  { value: "REPORT", label: "신고/제재", hint: "신고·이용제한" },
  { value: "BUG", label: "버그 신고", hint: "오류·장애" },
  { value: "FEATURE", label: "기능 제안", hint: "개선 아이디어" },
  { value: "ETC", label: "기타", hint: "그 외 문의" },
] as const;

export type InquiryCategory = (typeof INQUIRY_CATEGORIES)[number]["value"];

export const INQUIRY_STATUSES = ["WAITING", "ANSWERED", "CLOSED"] as const;
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

export const INQUIRY_STATUS_LABEL: Record<InquiryStatus, string> = {
  WAITING: "답변대기",
  ANSWERED: "답변완료",
  CLOSED: "종료",
};

export const INQUIRY_BODY_MIN = 20;
export const INQUIRY_BODY_MAX = 2000;
export const INQUIRY_TITLE_MAX = 100;
export const INQUIRY_FILE_MAX_BYTES = 10 * 1024 * 1024;
export const INQUIRY_FILE_MAX_COUNT = 5;

export interface InquiryAttachment {
  url: string;
  name: string;
  size: number;
}

export function isInquiryCategory(value: unknown): value is InquiryCategory {
  return INQUIRY_CATEGORIES.some((item) => item.value === value);
}

export function categoryLabel(value: InquiryCategory) {
  return INQUIRY_CATEGORIES.find((item) => item.value === value)?.label ?? value;
}
