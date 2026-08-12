/** 강제 탈퇴 등으로 재가입이 차단된 이메일 */

import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity({ name: "blocked_emails", schema: "public" })
export class BlockedEmail {
  @PrimaryColumn({ name: "email", type: "varchar", length: 255 })
  email!: string;

  @Column({
    name: "blocked_at",
    type: "timestamptz",
    default: () => "CURRENT_TIMESTAMP",
  })
  blockedAt!: Date;

  @Column({ name: "reason", type: "text", nullable: true })
  reason?: string | null;

  @Column({
    name: "blocked_by_admin_id",
    type: "varchar",
    length: 50,
    nullable: true,
  })
  blockedByAdminId?: string | null;

  @Column({
    name: "previous_user_id",
    type: "varchar",
    length: 50,
    nullable: true,
  })
  previousUserId?: string | null;
}
