/** 플레이리스트 읽기 권한 */

import type { DataSource } from "typeorm";
import { Playlist } from "@/src/lib/db/entities/Playlist";
import { ServiceError } from "@/src/lib/http/service-error";

export function assertPlaylistVisibleToViewer(
  playlist: { userId: string; isPublic: "Y" | "N" },
  viewerId?: string | null
) {
  if (viewerId !== playlist.userId && playlist.isPublic !== "Y") {
    throw new ServiceError("비공개 플레이리스트입니다.", 403);
  }
}

export async function assertPlaylistReadable(
  dataSource: DataSource,
  playlistId: string,
  viewerId?: string | null
) {
  const playlist = await dataSource.getRepository(Playlist).findOne({
    where: { id: playlistId },
    select: ["id", "userId", "isPublic"],
  });
  if (!playlist) {
    throw new ServiceError("플레이리스트를 찾을 수 없습니다.", 404);
  }
  assertPlaylistVisibleToViewer(playlist, viewerId);
}
