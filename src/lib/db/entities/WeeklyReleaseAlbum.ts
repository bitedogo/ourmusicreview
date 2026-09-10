/** 홈 주간 신보 앨범 엔티티 */

import { Entity, PrimaryColumn, Column, CreateDateColumn } from "typeorm";
import type { NewReleaseCategory, NewReleaseSource } from "@/src/lib/new-releases/types";

@Entity({ name: "weekly_release_albums", schema: "public" })
export class WeeklyReleaseAlbum {
  @PrimaryColumn({ name: "id", type: "varchar", length: 36 })
  id!: string;

  @Column({ name: "collection_id", type: "varchar", length: 50, unique: true })
  collectionId!: string;

  @Column({ name: "mbid", type: "varchar", length: 36, nullable: true, unique: true })
  mbid?: string | null;

  /** 화면에서는 쓰지 않음. 기존 행 호환용 */
  @Column({ name: "category", type: "varchar", length: 1 })
  category!: NewReleaseCategory;

  @Column({ name: "title", type: "varchar", length: 500 })
  title!: string;

  @Column({ name: "artist", type: "varchar", length: 255 })
  artist!: string;

  @Column({ name: "artist_id", type: "varchar", length: 50, nullable: true })
  artistId?: string | null;

  @Column({ name: "image_url", type: "varchar", length: 1000, nullable: true })
  imageUrl?: string | null;

  @Column({ name: "release_date", type: "varchar", length: 10 })
  releaseDate!: string;

  @Column({ name: "source", type: "varchar", length: 16, default: "itunes" })
  source!: NewReleaseSource;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;
}
