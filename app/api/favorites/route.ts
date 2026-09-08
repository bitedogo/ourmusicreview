/** POST/DELETE/GET 앨범 즐겨찾기 */

import { requireSessionApi } from "@/src/lib/auth/session";
import { withDatabase, withDatabaseRead } from "@/src/lib/db";
import { handleRouteError } from "@/src/lib/http/handle-route-error";
import { apiOk } from "@/src/lib/http/response";
import {
  addFavoriteAlbum,
  getUserFavoriteAlbums,
  removeFavoriteAlbum,
  type ToggleFavoriteInput,
} from "@/src/lib/favorites/favorites-service";

export async function POST(request: Request) {
  try {
    const { session, response } = await requireSessionApi();
    if (response) return response;

    const body = (await request.json()) as ToggleFavoriteInput;

    const result = await withDatabase((dataSource) =>
      addFavoriteAlbum(dataSource, session.user.id, body)
    );

    return apiOk(
      { favoriteId: result.favoriteId },
      { status: result.created ? 201 : 200 }
    );
  } catch (error) {
    return handleRouteError(error, "좋아요 추가 중 오류가 발생했습니다.");
  }
}

export async function DELETE(request: Request) {
  try {
    const { session, response } = await requireSessionApi();
    if (response) return response;

    const body = (await request.json()) as { albumId?: string };

    await withDatabase((dataSource) =>
      removeFavoriteAlbum(dataSource, session.user.id, body.albumId)
    );

    return apiOk({});
  } catch (error) {
    return handleRouteError(error, "좋아요 취소 중 오류가 발생했습니다.");
  }
}

export async function GET() {
  try {
    const { session, response } = await requireSessionApi();
    if (response) return response;

    const favorites = await withDatabaseRead((dataSource) =>
      getUserFavoriteAlbums(dataSource, session.user.id)
    );

    return apiOk({ favorites });
  } catch (error) {
    return handleRouteError(
      error,
      "좋아요한 앨범 목록 조회 중 오류가 발생했습니다."
    );
  }
}
