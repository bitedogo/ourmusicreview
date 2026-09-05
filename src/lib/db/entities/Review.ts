/** Review 엔티티 */

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
import { ReviewRejectionReason } from "@/src/lib/reviews/rejection-reasons";

@Entity({ name: "reviews", schema: "public" })
export class Review {
  @PrimaryColumn({ name: "id", type: "varchar", length: 255 })
  id!: string;

  @Column({ name: "content", type: "text" })
  content!: string;

  /** 0.0–10.0 저장. precision 2면 10.0이 numeric overflow 난다. */
  @Column({ name: "rating", type: "decimal", precision: 3, scale: 1 })
  rating!: number;

  @Column({ name: "is_approved", type: "varchar", length: 1 })
  isApproved!: "Y" | "N";

  @Column({
    name: "reject_reason",
    type: "varchar",
    length: 300,
    nullable: true,
  })
  rejectReason!: ReviewRejectionReason | null;

  @Column({ name: "user_id", type: "varchar", length: 50 })
  userId!: string;

  @Column({ name: "album_id", type: "varchar", length: 255 })
  albumId!: string;

  @Column({ name: "views", type: "int", default: 0 })
  views!: number;

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
