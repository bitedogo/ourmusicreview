/** POST/PATCH 플레이리스트 트랙 추가·정렬 */

import { requireSessionApi } from "@/src/lib/auth/session";
import { initializeDatabase } from "@/src/lib/db";
import { apiError, apiOk } from "@/src/lib/http/response";
import { ServiceError } from "@/src/lib/http/service-error";
import {
  addTrackToPlaylist,
  reorderPlaylistTracks,
  type AddPlaylistTrackInput,
  type ReorderPlaylistTracksInput,
} from "@/src/lib/playlists/playlist-track-service";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return apiError("플레이리스트 ID가 필요합니다.", { status: 400 });
    }

    const { session, response } = await requireSessionApi();
    if (response) return response;

    const body = (await request.json()) as AddPlaylistTrackInput;
    const dataSource = await initializeDatabase();
    const result = await addTrackToPlaylist(dataSource, id, session.user.id, body);
    return apiOk(
      { playlistTrackId: result.trackId, created: result.created },
      { status: result.created ? 201 : 200 }
    );
  } catch (error) {
    if (error instanceof ServiceError) {
      return apiError(error.message, { status: error.status });
    }
    return apiError(
      error instanceof Error ? error.message : "트랙 추가 중 오류가 발생했습니다.",
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return apiError("플레이리스트 ID가 필요합니다.", { status: 400 });
    }

    const { session, response } = await requireSessionApi();
    if (response) return response;

    const body = (await request.json()) as ReorderPlaylistTracksInput;
    const dataSource = await initializeDatabase();
    await reorderPlaylistTracks(dataSource, id, session.user.id, body);
    return apiOk({});
  } catch (error) {
    if (error instanceof ServiceError) {
      return apiError(error.message, { status: error.status });
    }
    return apiError(
      error instanceof Error ? error.message : "트랙 순서 변경 중 오류가 발생했습니다.",
      { status: 500 }
    );
  }
}
