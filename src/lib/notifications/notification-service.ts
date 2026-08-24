/** 사용자 알림 서비스 */

import { randomUUID } from "crypto";
import type { DataSource } from "typeorm";
import {
  Notification,
  type NotificationType,
} from "@/src/lib/db/entities/Notification";
import { ServiceError } from "@/src/lib/http/service-error";

interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

interface CreateNotificationInput {
  userId: string;
  actorUserId?: string | null;
  type: NotificationType;
  title: string;
  body?: string | null;
  link?: string | null;
}

function createNotificationId(): string {
  return randomUUID().replace(/-/g, "").slice(0, 24);
}

async function createNotification(
  dataSource: DataSource,
  input: CreateNotificationInput
) {
  if (!input.userId || !input.title.trim()) {
    throw new ServiceError("알림 생성에 필요한 값이 없습니다.", 400);
  }

  await dataSource.query(
    `INSERT INTO notifications
      (id, user_id, actor_user_id, type, title, body, link, is_read)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'N')`,
    [
      createNotificationId(),
      input.userId,
      input.actorUserId ?? null,
      input.type,
      input.title.trim().slice(0, 200),
      input.body?.trim() ? input.body.trim() : null,
      input.link?.trim() ? input.link.trim() : null,
    ]
  );
}

export async function safeCreateNotification(
  dataSource: DataSource,
  input: CreateNotificationInput
) {
  try {
    await createNotification(dataSource, input);
  } catch (error) {
    console.error("[notifications] create failed:", error);
  }
}

export async function notifyUnlessSelf(
  dataSource: DataSource,
  recipientUserId: string | null | undefined,
  actorUserId: string,
  input: Omit<CreateNotificationInput, "userId" | "actorUserId">
) {
  if (!recipientUserId || recipientUserId === actorUserId) return;
  await safeCreateNotification(dataSource, {
    ...input,
    userId: recipientUserId,
    actorUserId,
  });
}

export async function listNotifications(
  dataSource: DataSource,
  userId: string,
  limit = 20,
  unreadOnly = false
) {
  const safeLimit = Math.max(1, Math.min(limit, 50));
  const repo = dataSource.getRepository(Notification);
  const rows = await repo.find({
    where: unreadOnly ? { userId, isRead: "N" } : { userId },
    order: { createdAt: "DESC" },
    take: safeLimit,
  });

  const unreadCount = await repo.count({
    where: { userId, isRead: "N" },
  });

  const items: NotificationItem[] = rows.map((row) => ({
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body ?? null,
    link: row.link ?? null,
    isRead: row.isRead === "Y",
    createdAt: new Date(row.createdAt).toISOString(),
  }));

  return { items, unreadCount };
}

export async function markNotificationRead(
  dataSource: DataSource,
  userId: string,
  notificationId: string
) {
  const repo = dataSource.getRepository(Notification);
  const row = await repo.findOne({
    where: { id: notificationId, userId },
  });
  if (!row) {
    throw new ServiceError("알림을 찾을 수 없습니다.", 404);
  }
  if (row.isRead !== "Y") {
    row.isRead = "Y";
    await repo.save(row);
  }
}

export async function markAllNotificationsRead(
  dataSource: DataSource,
  userId: string
) {
  await dataSource
    .createQueryBuilder()
    .update(Notification)
    .set({ isRead: "Y" })
    .where("user_id = :userId", { userId })
    .andWhere("is_read = 'N'")
    .execute();
}
