/** GET/PATCH/DELETE 플레이리스트 단건 */

import { revalidatePath } from "next/cache";
import { getAppSession, requireSessionApi } from "@/src/lib/auth/session";
import { withDatabase, withDatabaseRead } from "@/src/lib/db";
import { handleApi } from "@/src/lib/http/handle-route-error";
import { parseJsonBody } from "@/src/lib/http/schema";
import { apiError, apiOk } from "@/src/lib/http/response";
import { updatePlaylistInputSchema } from "@/src/lib/playlists/contracts";
import {
  deletePlaylist,
  getPlaylistDetail,
  updatePlaylist,
} from "@/src/lib/playlists/playlist-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleApi("플레이리스트 조회 중 오류가 발생했습니다.", async () => {
    const { id } = await params;
    if (!id) {
      return apiError("플레이리스트 ID가 필요합니다.", { status: 400 });
    }

    const session = await getAppSession();
    const playlist = await withDatabaseRead((dataSource) =>
      getPlaylistDetail(dataSource, id, session?.user?.id ?? null)
    );
    return apiOk({ playlist });
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleApi("플레이리스트 수정 중 오류가 발생했습니다.", async () => {
    const { id } = await params;
    if (!id) {
      return apiError("플레이리스트 ID가 필요합니다.", { status: 400 });
    }

    const { session, response } = await requireSessionApi();
    if (response) return response;

    const body = await parseJsonBody(request, updatePlaylistInputSchema);
    const playlist = await withDatabase((dataSource) =>
      updatePlaylist(dataSource, id, session.user.id, body)
    );
    revalidatePath("/playlist");
    revalidatePath(`/playlist/${id}`);
    revalidatePath("/profile");
    return apiOk({ playlist });
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return handleApi("플레이리스트 삭제 중 오류가 발생했습니다.", async () => {
    const { id } = await params;
    if (!id) {
      return apiError("플레이리스트 ID가 필요합니다.", { status: 400 });
    }

    const { session, response } = await requireSessionApi();
    if (response) return response;

    await withDatabase((dataSource) =>
      deletePlaylist(dataSource, id, session.user.id)
    );
    revalidatePath("/playlist");
    revalidatePath(`/playlist/${id}`);
    revalidatePath("/profile");
    return apiOk({});
  });
}
