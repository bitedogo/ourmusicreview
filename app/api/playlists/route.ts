/** GET/POST 내 플레이리스트 */

import { requireSessionApi } from "@/src/lib/auth/session";
import { initializeDatabase } from "@/src/lib/db";
import { apiError, apiOk } from "@/src/lib/http/response";
import { ServiceError } from "@/src/lib/http/service-error";
import {
  createPlaylist,
  listMyPlaylists,
  type CreatePlaylistInput,
} from "@/src/lib/playlists/playlist-service";

export async function GET() {
  try {
    const { session, response } = await requireSessionApi();
    if (response) return response;

    const dataSource = await initializeDatabase();
    const playlists = await listMyPlaylists(dataSource, session.user.id);
    return apiOk({ playlists });
  } catch (error) {
    if (error instanceof ServiceError) {
      return apiError(error.message, { status: error.status });
    }
    return apiError(
      error instanceof Error
        ? error.message
        : "플레이리스트 목록 조회 중 오류가 발생했습니다.",
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { session, response } = await requireSessionApi();
    if (response) return response;

    const body = (await request.json()) as CreatePlaylistInput;
    const dataSource = await initializeDatabase();
    const playlist = await createPlaylist(dataSource, session.user.id, body);

    return apiOk({ playlist }, { status: 201 });
  } catch (error) {
    if (error instanceof ServiceError) {
      return apiError(error.message, { status: error.status });
    }
    return apiError(
      error instanceof Error
        ? error.message
        : "플레이리스트 생성 중 오류가 발생했습니다.",
      { status: 500 }
    );
  }
}
