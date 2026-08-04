/** PlaylistGenre — Playlist ↔ Genre N:M */

import { Entity, PrimaryColumn, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { Playlist } from "./Playlist";
import { Genre } from "./Genre";

@Entity({ name: "playlist_genres", schema: "public" })
export class PlaylistGenre {
  @PrimaryColumn({ name: "playlist_id", type: "varchar", length: 255 })
  playlistId!: string;

  @PrimaryColumn({ name: "genre_id", type: "varchar", length: 100 })
  genreId!: string;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @ManyToOne(() => Playlist, { onDelete: "CASCADE" })
  @JoinColumn({ name: "playlist_id" })
  playlist!: Playlist;

  @ManyToOne(() => Genre, { onDelete: "CASCADE" })
  @JoinColumn({ name: "genre_id" })
  genre!: Genre;
}
