import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from "typeorm";
import { User } from "./User";
import { Album } from "./Album";

@Entity({ name: "user_favorite_albums", schema: "public" })
export class UserFavoriteAlbum {
  @PrimaryColumn({ name: "id", type: "varchar", length: 255 })
  id!: string;

  @Column({ name: "user_id", type: "varchar", length: 50 })
  userId!: string;

  @Column({ name: "album_id", type: "varchar", length: 255 })
  albumId!: string;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @ManyToOne(() => Album, { onDelete: "CASCADE" })
  @JoinColumn({ name: "album_id" })
  album!: Album;
}
