import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";
import { User } from "./User";
import { Post } from "./Post";
import { Review } from "./Review";

@Entity({ name: "reports", schema: "public" })
export class Report {
  @PrimaryColumn({ name: "id", type: "varchar", length: 50 })
  id!: string;

  @Column({ name: "reason", type: "varchar", length: 500 })
  reason!: string;

  @Column({ name: "user_id", type: "varchar", length: 50 })
  userId!: string;

  @Column({ name: "post_id", type: "varchar", length: 50, nullable: true })
  postId?: string | null;

  @Column({ name: "review_id", type: "varchar", length: 255, nullable: true })
  reviewId?: string | null;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @ManyToOne(() => Post, { onDelete: "CASCADE", nullable: true })
  @JoinColumn({ name: "post_id" })
  post?: Post | null;

  @ManyToOne(() => Review, { onDelete: "CASCADE", nullable: true })
  @JoinColumn({ name: "review_id" })
  review?: Review | null;
}
