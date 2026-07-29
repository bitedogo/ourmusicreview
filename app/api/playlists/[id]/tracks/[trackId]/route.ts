/** DELETE 플레이리스트 트랙 제거 */

import { requireSessionApi } from "@/src/lib/auth/session";
import { initializeDatabase } from "@/src/lib/db";
import { apiError, apiOk } from "@/src/lib/http/response";
import { ServiceError } from "@/src/lib/http/service-error";
import { removeTrackFromPlaylist } from "@/src/lib/playlists/playlist-track-service";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; trackId: string }> }
) {
  try {
    const { id, trackId } = await params;
    if (!id || !trackId) {
      return apiError("플레이리스트 ID와 트랙 ID가 필요합니다.", { status: 400 });
    }

    const { session, response } = await requireSessionApi();
    if (response) return response;

    const dataSource = await initializeDatabase();
    await removeTrackFromPlaylist(dataSource, id, trackId, session.user.id);
    return apiOk({});
  } catch (error) {
    if (error instanceof ServiceError) {
      return apiError(error.message, { status: error.status });
    }
    return apiError(
      error instanceof Error ? error.message : "트랙 삭제 중 오류가 발생했습니다.",
      { status: 500 }
    );
  }
}
