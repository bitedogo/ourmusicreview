/** 1:1 문의 */

import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";
import type {
  InquiryAttachment,
  InquiryCategory,
  InquiryStatus,
} from "@/src/lib/inquiries/types";

@Entity({ name: "inquiries", schema: "public" })
export class Inquiry {
  @PrimaryColumn({ name: "id", type: "varchar", length: 24 })
  id!: string;

  @Column({ name: "public_code", type: "varchar", length: 20, unique: true })
  publicCode!: string;

  @Column({ name: "user_id", type: "varchar", length: 50 })
  userId!: string;

  @Column({ name: "category", type: "varchar", length: 20 })
  category!: InquiryCategory;

  @Column({ name: "email", type: "varchar", length: 255 })
  email!: string;

  @Column({ name: "contact", type: "varchar", length: 40, nullable: true })
  contact?: string | null;

  @Column({ name: "title", type: "varchar", length: 100 })
  title!: string;

  @Column({ name: "body", type: "text" })
  body!: string;

  @Column({ name: "attachments", type: "jsonb", default: () => "'[]'" })
  attachments!: InquiryAttachment[];

  @Column({ name: "status", type: "varchar", length: 20, default: () => "'WAITING'" })
  status!: InquiryStatus;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;
}
