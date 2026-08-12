/** GET/POST 내 플레이리스트 */

import { requireSessionApi } from "@/src/lib/auth/session";
import { initializeDatabase } from "@/src/lib/db";
import { handleRouteError } from "@/src/lib/http/handle-route-error";
import { apiOk } from "@/src/lib/http/response";
import {
  createPlaylist,
  listMyPlaylists,
  type CreatePlaylistInput,
} from "@/src/lib/playlists/playlist-service";

export async function GET(request: Request) {
  try {
    const { session, response } = await requireSessionApi();
    if (response) return response;

    const { searchParams } = new URL(request.url);
    const genre = searchParams.get("genre");

    const dataSource = await initializeDatabase();
    const playlists = await listMyPlaylists(
      dataSource,
      session.user.id,
      genre
    );
    return apiOk({ playlists });
  } catch (error) {
    return handleRouteError(
      error,
      "플레이리스트 목록 조회 중 오류가 발생했습니다."
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
    return handleRouteError(
      error,
      "플레이리스트 생성 중 오류가 발생했습니다."
    );
  }
}
