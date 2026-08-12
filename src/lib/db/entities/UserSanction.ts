/** 회원 제재(경고/일시 정지) 이력 */

import { Entity, PrimaryColumn, Column } from "typeorm";

export type UserSanctionAction = "WARN" | "SUSPEND" | "UNSUSPEND";

@Entity({ name: "user_sanctions", schema: "public" })
export class UserSanction {
  @PrimaryColumn({ name: "id", type: "varchar", length: 24 })
  id!: string;

  @Column({ name: "user_id", type: "varchar", length: 50 })
  userId!: string;

  @Column({ name: "admin_id", type: "varchar", length: 50 })
  adminId!: string;

  @Column({ name: "action", type: "varchar", length: 20 })
  action!: UserSanctionAction;

  @Column({ name: "reason", type: "text" })
  reason!: string;

  @Column({
    name: "suspended_until",
    type: "timestamptz",
    nullable: true,
  })
  suspendedUntil?: Date | null;

  @Column({
    name: "created_at",
    type: "timestamptz",
    default: () => "CURRENT_TIMESTAMP",
  })
  createdAt!: Date;
}
