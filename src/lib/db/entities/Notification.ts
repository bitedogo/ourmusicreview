/** 사용자 알림 엔티티 */

import { Entity, PrimaryColumn, Column, CreateDateColumn } from "typeorm";

const NOTIFICATION_TYPES = [
  "POST_LIKE",
  "REVIEW_LIKE",
  "PLAYLIST_LIKE",
  "COMMENT_LIKE",
  "POST_COMMENT",
  "REVIEW_COMMENT",
  "PLAYLIST_COMMENT",
  "COMMENT_REPLY",
  "ADMIN_WARN",
  "ADMIN_SUSPEND",
  "ADMIN_UNSUSPEND",
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

@Entity({ name: "notifications", schema: "public" })
export class Notification {
  @PrimaryColumn({ name: "id", type: "varchar", length: 24 })
  id!: string;

  @Column({ name: "user_id", type: "varchar", length: 50 })
  userId!: string;

  @Column({ name: "actor_user_id", type: "varchar", length: 50, nullable: true })
  actorUserId?: string | null;

  @Column({ name: "type", type: "varchar", length: 40 })
  type!: NotificationType;

  @Column({ name: "title", type: "varchar", length: 200 })
  title!: string;

  @Column({ name: "body", type: "text", nullable: true })
  body?: string | null;

  @Column({ name: "link", type: "varchar", length: 500, nullable: true })
  link?: string | null;

  @Column({ name: "is_read", type: "char", length: 1, default: () => "'N'" })
  isRead!: "Y" | "N";

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;
}
