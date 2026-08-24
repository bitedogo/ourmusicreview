/** 공지 안 읽음 개수·읽음 처리 */

import type { DataSource } from "typeorm";
import { MoreThan } from "typeorm";
import { Post } from "@/src/lib/db/entities/Post";
import { UserAnnouncementCursor } from "@/src/lib/db/entities/UserAnnouncementCursor";

async function ensureAnnouncementCursor(
  dataSource: DataSource,
  userId: string
) {
  await dataSource.query(
    `INSERT INTO public.user_announcement_cursors (user_id, last_seen_at)
     VALUES ($1, NOW())
     ON CONFLICT (user_id) DO NOTHING`,
    [userId]
  );
}

export async function countUnreadAnnouncements(
  dataSource: DataSource,
  userId: string
) {
  await ensureAnnouncementCursor(dataSource, userId);
  const cursor = await dataSource.getRepository(UserAnnouncementCursor).findOne({
    where: { userId },
  });
  const since = cursor?.lastSeenAt ? new Date(cursor.lastSeenAt) : new Date();

  return dataSource.getRepository(Post).count({
    where: {
      category: "N",
      createdAt: MoreThan(since),
    },
  });
}

export async function markAnnouncementsSeen(
  dataSource: DataSource,
  userId: string
) {
  await dataSource.query(
    `INSERT INTO public.user_announcement_cursors (user_id, last_seen_at)
     VALUES ($1, NOW())
     ON CONFLICT (user_id) DO UPDATE SET last_seen_at = EXCLUDED.last_seen_at`,
    [userId]
  );
}
