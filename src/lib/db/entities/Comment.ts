/** Comment 엔티티 */

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
import { Playlist } from "./Playlist";

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

  @Column({ name: "playlist_id", type: "varchar", length: 255, nullable: true })
  playlistId?: string | null;

  @Column({ name: "parent_id", type: "varchar", length: 50, nullable: true })
  parentId?: string | null;

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

  @ManyToOne(() => Playlist, { onDelete: "CASCADE", nullable: true })
  @JoinColumn({ name: "playlist_id" })
  playlist?: Playlist | null;

  @ManyToOne(() => Comment, { onDelete: "CASCADE", nullable: true })
  @JoinColumn({ name: "parent_id" })
  parent?: Comment | null;
}
