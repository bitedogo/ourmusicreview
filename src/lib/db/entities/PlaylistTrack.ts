/** PlaylistTrack 엔티티 */

import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Playlist } from "./Playlist";

@Entity({ name: "playlist_tracks", schema: "public" })
export class PlaylistTrack {
  @PrimaryColumn({ name: "id", type: "varchar", length: 255 })
  id!: string;

  @Column({ name: "playlist_id", type: "varchar", length: 255 })
  playlistId!: string;

  @Column({ name: "track_id", type: "varchar", length: 255 })
  trackId!: string;

  @Column({ name: "track_name", type: "varchar", length: 500 })
  trackName!: string;

  @Column({ name: "artist_name", type: "varchar", length: 255 })
  artistName!: string;

  @Column({ name: "collection_id", type: "varchar", length: 255, nullable: true })
  collectionId!: string | null;

  @Column({ name: "collection_name", type: "varchar", length: 500, nullable: true })
  collectionName!: string | null;

  @Column({ name: "artwork_url_100", type: "varchar", length: 1000, nullable: true })
  artworkUrl100!: string | null;

  @Column({ name: "preview_url", type: "varchar", length: 1000, nullable: true })
  previewUrl!: string | null;

  @Column({ name: "track_number", type: "int", nullable: true })
  trackNumber!: number | null;

  @Column({ name: "disc_number", type: "int", nullable: true })
  discNumber!: number | null;

  @Column({ name: "duration_ms", type: "int", nullable: true })
  durationMs!: number | null;

  @Column({ name: "position", type: "int", default: 0 })
  position!: number;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt!: Date;

  @ManyToOne(() => Playlist, { onDelete: "CASCADE" })
  @JoinColumn({ name: "playlist_id" })
  playlist!: Playlist;
}
