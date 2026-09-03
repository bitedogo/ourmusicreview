/** 1:1 문의 답변 */

import { Entity, PrimaryColumn, Column, CreateDateColumn } from "typeorm";

@Entity({ name: "inquiry_replies", schema: "public" })
export class InquiryReply {
  @PrimaryColumn({ name: "id", type: "varchar", length: 24 })
  id!: string;

  @Column({ name: "inquiry_id", type: "varchar", length: 24 })
  inquiryId!: string;

  @Column({ name: "author_user_id", type: "varchar", length: 50 })
  authorUserId!: string;

  @Column({ name: "is_admin", type: "char", length: 1, default: () => "'N'" })
  isAdmin!: "Y" | "N";

  @Column({ name: "body", type: "text" })
  body!: string;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;
}
