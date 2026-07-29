/** GET 타 유저 공개 플레이리스트 목록 */

import { initializeDatabase } from "@/src/lib/db";
import { User } from "@/src/lib/db/entities/User";
import { apiError, apiOk } from "@/src/lib/http/response";
import { ynToBool } from "@/src/lib/profile/privacy";
import { listPublicPlaylistsByUser } from "@/src/lib/playlists/playlist-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    if (!userId) {
      return apiError("사용자 ID가 필요합니다.", { status: 400 });
    }

    const dataSource = await initializeDatabase();
    const user = await dataSource.getRepository(User).findOne({
      where: { id: userId },
      select: ["id", "showPlaylistsPublic"],
    });

    if (!user) {
      return apiError("사용자를 찾을 수 없습니다.", { status: 404 });
    }

    if (!ynToBool(user.showPlaylistsPublic)) {
      return apiOk({ playlists: [] });
    }

    const playlists = await listPublicPlaylistsByUser(dataSource, userId);
    return apiOk({ playlists });
  } catch (error) {
    return apiError(
      error instanceof Error
        ? error.message
        : "공개 플레이리스트 조회 중 오류가 발생했습니다.",
      { status: 500 }
    );
  }
}
