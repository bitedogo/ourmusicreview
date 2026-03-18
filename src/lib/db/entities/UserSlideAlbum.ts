import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity({ name: "user_slide_albums", schema: "public" })
export class UserSlideAlbum {
  @PrimaryColumn({ name: "id", type: "varchar", length: 36 })
  id!: string;

  @Column({ name: "user_id", type: "varchar", length: 50 })
  userId!: string;

  @Column({ name: "position", type: "int" })
  position!: number;

  @Column({ name: "collection_id", type: "varchar", length: 50 })
  collectionId!: string;

  @Column({ name: "title", type: "varchar", length: 500 })
  title!: string;

  @Column({ name: "artist", type: "varchar", length: 255 })
  artist!: string;

  @Column({ name: "image_url", type: "varchar", length: 1000, nullable: true })
  imageUrl?: string;

  @Column({ name: "release_date", type: "varchar", length: 20, nullable: true })
  releaseDate?: string;

  @Column({ name: "genre", type: "varchar", length: 100, nullable: true })
  genre?: string;
}
