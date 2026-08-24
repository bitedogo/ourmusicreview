/** 공지 읽음 커서 */

import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity({ name: "user_announcement_cursors", schema: "public" })
export class UserAnnouncementCursor {
  @PrimaryColumn({ name: "user_id", type: "varchar", length: 50 })
  userId!: string;

  @Column({ name: "last_seen_at", type: "timestamp" })
  lastSeenAt!: Date;
}
