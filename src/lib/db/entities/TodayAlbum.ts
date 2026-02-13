import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity({ name: "today_albums", schema: "public" })
export class TodayAlbum {
  @PrimaryColumn({ name: "display_date", type: "date" })
  displayDate!: Date;

  @Column({ name: "title", type: "varchar", length: 500 })
  title!: string;

  @Column({ name: "artist", type: "varchar", length: 255 })
  artist!: string;

  @Column({ name: "image_url", type: "varchar", length: 1000, nullable: true })
  imageUrl?: string;

  @Column({ name: "description", type: "text", nullable: true })
  description?: string;
}
