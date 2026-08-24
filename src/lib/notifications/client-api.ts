/** 헤더 알림 API 클라이언트 */

import { fetchJson } from "@/src/lib/http/client";
import type { NotificationType } from "@/src/lib/db/entities/Notification";

export interface AnnouncementItem {
  id: string;
  title: string;
  noticeCategory: string | null;
  createdAt: string;
  link: string;
}

export interface MailNotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

export async function fetchAnnouncements(limit = 10) {
  return fetchJson<{ ok: true; data: { items: AnnouncementItem[] } }>(
    `/api/announcements?limit=${Math.max(1, limit)}`
  );
}

export async function fetchMailNotifications(limit = 20, unreadOnly = false) {
  const params = new URLSearchParams({
    limit: String(Math.max(1, limit)),
  });
  if (unreadOnly) {
    params.set("unreadOnly", "true");
  }
  return fetchJson<{
    ok: true;
    data: { items: MailNotificationItem[]; unreadCount: number };
  }>(`/api/notifications?${params.toString()}`);
}

export async function markNotificationRead(id: string) {
  return fetchJson<{ ok: true }>(
    `/api/notifications/${encodeURIComponent(id)}/read`,
    { method: "POST" }
  );
}

export async function markAllNotificationsRead() {
  return fetchJson<{ ok: true }>(`/api/notifications`, { method: "PATCH" });
}
