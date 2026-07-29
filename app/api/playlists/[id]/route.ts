/** GET/PATCH/DELETE 플레이리스트 단건 */

import { getAppSession, requireSessionApi } from "@/src/lib/auth/session";
import { initializeDatabase } from "@/src/lib/db";
import { apiError, apiOk } from "@/src/lib/http/response";
import { ServiceError } from "@/src/lib/http/service-error";
import {
  deletePlaylist,
  getPlaylistDetail,
  updatePlaylist,
  type UpdatePlaylistInput,
} from "@/src/lib/playlists/playlist-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return apiError("플레이리스트 ID가 필요합니다.", { status: 400 });
    }

    const session = await getAppSession();
    const dataSource = await initializeDatabase();
    const playlist = await getPlaylistDetail(dataSource, id, session?.user?.id ?? null);
    return apiOk({ playlist });
  } catch (error) {
    if (error instanceof ServiceError) {
      return apiError(error.message, { status: error.status });
    }
    return apiError(
      error instanceof Error
        ? error.message
        : "플레이리스트 조회 중 오류가 발생했습니다.",
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

    const body = (await request.json()) as UpdatePlaylistInput;
    const dataSource = await initializeDatabase();
    const playlist = await updatePlaylist(dataSource, id, session.user.id, body);
    return apiOk({ playlist });
  } catch (error) {
    if (error instanceof ServiceError) {
      return apiError(error.message, { status: error.status });
    }
    return apiError(
      error instanceof Error
        ? error.message
        : "플레이리스트 수정 중 오류가 발생했습니다.",
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return apiError("플레이리스트 ID가 필요합니다.", { status: 400 });
    }

    const { session, response } = await requireSessionApi();
    if (response) return response;

    const dataSource = await initializeDatabase();
    await deletePlaylist(dataSource, id, session.user.id);
    return apiOk({});
  } catch (error) {
    if (error instanceof ServiceError) {
      return apiError(error.message, { status: error.status });
    }
    return apiError(
      error instanceof Error
        ? error.message
        : "플레이리스트 삭제 중 오류가 발생했습니다.",
      { status: 500 }
    );
  }
}
