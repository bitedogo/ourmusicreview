import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./User";
import type { NoticeCategory } from "@/src/lib/community/types";

export type PostCategory = "K" | "I" | "M" | "W" | "N";
export type { NoticeCategory } from "@/src/lib/community/types";

@Entity({ name: "posts", schema: "public" })
export class Post {
  @PrimaryColumn({ name: "id", type: "varchar", length: 50 })
  id!: string;

  @Column({ name: "title", type: "varchar", length: 200 })
  title!: string;

  @Column({ name: "content", type: "text" })
  content!: string;

  @Column({ name: "category", type: "varchar", length: 1 })
  category!: PostCategory;

  @Column({ name: "user_id", type: "varchar", length: 50 })
  userId!: string;

  @Column({ name: "nickname", type: "varchar", length: 50 })
  nickname!: string;

  @Column({ name: "views", type: "int", default: 0 })
  views!: number;

  @Column({ name: "is_global", type: "char", length: 1, default: "N" })
  isGlobal!: "Y" | "N";

  @Column({ name: "notice_category", type: "varchar", length: 20, nullable: true })
  noticeCategory!: NoticeCategory | null;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt!: Date;

  @ManyToOne(() => User, { onDelete: "SET NULL" })
  @JoinColumn({ name: "user_id" })
  user!: User;
}
