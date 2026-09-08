/** GET/POST 내 플레이리스트 */

import { revalidatePath } from "next/cache";
import { requireSessionApi } from "@/src/lib/auth/session";
import { withDatabase, withDatabaseRead } from "@/src/lib/db";
import { handleApi } from "@/src/lib/http/handle-route-error";
import { parseJsonBody } from "@/src/lib/http/schema";
import { apiOk } from "@/src/lib/http/response";
import {
  createPlaylistInputSchema,
} from "@/src/lib/playlists/contracts";
import {
  createPlaylist,
  listMyPlaylists,
} from "@/src/lib/playlists/playlist-service";

export async function GET(request: Request) {
  return handleApi("플레이리스트 목록 조회 중 오류가 발생했습니다.", async () => {
    const { session, response } = await requireSessionApi();
    if (response) return response;

    const { searchParams } = new URL(request.url);
    const genre = searchParams.get("genre");

    const playlists = await withDatabaseRead((dataSource) =>
      listMyPlaylists(dataSource, session.user.id, genre)
    );
    return apiOk({ playlists });
  });
}

export async function POST(request: Request) {
  return handleApi("플레이리스트 생성 중 오류가 발생했습니다.", async () => {
    const { session, response } = await requireSessionApi();
    if (response) return response;

    const body = await parseJsonBody(request, createPlaylistInputSchema);
    const playlist = await withDatabase((dataSource) =>
      createPlaylist(dataSource, session.user.id, body)
    );
    revalidatePath("/playlist");
    revalidatePath("/profile");

    return apiOk({ playlist }, { status: 201 });
  });
}
