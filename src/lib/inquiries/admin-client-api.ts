/** 관리자 문의 API 클라이언트 */

import { fetchJson } from "@/src/lib/http/client";
import type {
  InquiryDetail,
  InquiryListItem,
  InquiryListResponse,
  InquiryReplyItem,
} from "@/src/lib/inquiries/client-api";
import type { InquiryStatus } from "@/src/lib/inquiries/types";

export interface AdminInquiryListItem extends InquiryListItem {
  userId: string;
  userNickname: string;
}

export interface AdminInquiryDetail extends InquiryDetail {
  userNickname: string;
}

export async function fetchAdminInquiries(page = 1, status?: InquiryStatus) {
  const params = new URLSearchParams({ page: String(Math.max(1, page)) });
  if (status) params.set("status", status);
  return fetchJson<{ ok: true; data: InquiryListResponse & { items: AdminInquiryListItem[] } }>(
    `/api/admin/inquiries?${params.toString()}`
  );
}

export async function fetchAdminInquiryDetail(id: string) {
  return fetchJson<{ ok: true; data: { inquiry: AdminInquiryDetail } }>(
    `/api/admin/inquiries/${encodeURIComponent(id)}`
  );
}

export async function replyAdminInquiry(id: string, body: string) {
  return fetchJson<{ ok: true; data: { reply: InquiryReplyItem } }>(
    `/api/admin/inquiries/${encodeURIComponent(id)}/reply`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    }
  );
}

export async function closeAdminInquiry(id: string) {
  return fetchJson<{ ok: true; data: { inquiry: InquiryListItem } }>(
    `/api/admin/inquiries/${encodeURIComponent(id)}`,
    { method: "PATCH" }
  );
}
