/** Playlist 엔티티 */

import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User";

@Entity({ name: "playlists", schema: "public" })
export class Playlist {
  @PrimaryColumn({ name: "id", type: "varchar", length: 255 })
  id!: string;

  @Column({ name: "user_id", type: "varchar", length: 50 })
  userId!: string;

  @Column({ name: "title", type: "varchar", length: 255 })
  title!: string;

  @Column({ name: "description", type: "text", nullable: true })
  description!: string | null;

  @Column({ name: "is_public", type: "varchar", length: 1, default: () => "'N'" })
  isPublic!: "Y" | "N";

  @Column({ name: "cover_image_url", type: "varchar", length: 1000, nullable: true })
  coverImageUrl!: string | null;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt!: Date;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: User;
}
