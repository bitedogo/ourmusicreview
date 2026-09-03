/** 1:1 문의 API 클라이언트 */

import { fetchJson } from "@/src/lib/http/client";
import type {
  InquiryAttachment,
  InquiryCategory,
  InquiryStatus,
} from "@/src/lib/inquiries/types";

export interface InquiryListItem {
  id: string;
  publicCode: string;
  category: InquiryCategory;
  title: string;
  status: InquiryStatus;
  createdAt: string;
}

export interface InquiryReplyItem {
  id: string;
  body: string;
  isAdmin: boolean;
  createdAt: string;
}

export interface InquiryDetail extends InquiryListItem {
  email: string;
  contact: string | null;
  body: string;
  attachments: InquiryAttachment[];
  replies: InquiryReplyItem[];
  userId: string;
}

export interface InquiryListResponse {
  items: InquiryListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function fetchMyInquiries(page = 1) {
  return fetchJson<{ ok: true; data: InquiryListResponse }>(
    `/api/inquiries?page=${Math.max(1, page)}`
  );
}

export async function fetchInquiryDetail(id: string) {
  return fetchJson<{ ok: true; data: { inquiry: InquiryDetail } }>(
    `/api/inquiries/${encodeURIComponent(id)}`
  );
}

export async function createInquiryApi(input: {
  category: InquiryCategory;
  email: string;
  contact?: string;
  title: string;
  body: string;
  attachments?: InquiryAttachment[];
  consent: boolean;
}) {
  return fetchJson<{ ok: true; data: InquiryListItem }>("/api/inquiries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function uploadInquiryAttachmentApi(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return fetchJson<{ ok: true; data: { attachment: InquiryAttachment } }>(
    "/api/inquiries/upload",
    { method: "POST", body: formData }
  );
}
