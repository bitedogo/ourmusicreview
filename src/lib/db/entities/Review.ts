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
import { Album } from "./Album";

@Entity({ name: "reviews", schema: "public" })
export class Review {
  @PrimaryColumn({ name: "id", type: "varchar", length: 255 })
  id!: string;

  @Column({ name: "content", type: "text" })
  content!: string;

  @Column({ name: "rating", type: "decimal", precision: 2, scale: 1 })
  rating!: number;

  @Column({ name: "is_approved", type: "varchar", length: 1 })
  isApproved!: "Y" | "N";

  @Column({ name: "user_id", type: "varchar", length: 50 })
  userId!: string;

  @Column({ name: "album_id", type: "varchar", length: 255 })
  albumId!: string;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp" })
  updatedAt!: Date;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @ManyToOne(() => Album, { onDelete: "CASCADE" })
  @JoinColumn({ name: "album_id" })
  album!: Album;
}
