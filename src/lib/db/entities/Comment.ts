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

@Entity({ name: "comments", schema: "public" })
export class Comment {
  @PrimaryColumn({ name: "id", type: "varchar", length: 50 })
  id!: string;

  @Column({ name: "content", type: "text" })
  content!: string;

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
