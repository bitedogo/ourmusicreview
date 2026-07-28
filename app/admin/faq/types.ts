/** 관리자 FAQ 관리 공통 타입 정의 */

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
}

export interface FaqListResponse {
  ok: true;
  data: { faqs: FaqItem[] };
}
