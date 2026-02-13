import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity({ name: "albums", schema: "public" })
export class Album {
  @PrimaryColumn({ name: "album_id", type: "varchar", length: 255 })
  albumId!: string;

  @Column({ name: "title", type: "varchar", length: 500 })
  title!: string;

  @Column({ name: "artist", type: "varchar", length: 255 })
  artist!: string;

  @Column({ name: "image_url", type: "varchar", length: 1000, nullable: true })
  imageUrl?: string;

  @Column({ name: "release_date", type: "date", nullable: true })
  releaseDate?: Date;

  @Column({ name: "category", type: "varchar", length: 1 })
  category!: "K" | "I";
}
