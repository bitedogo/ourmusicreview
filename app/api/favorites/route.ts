/** POST/DELETE/GET 앨범 즐겨찾기 */

import { requireSessionApi } from "@/src/lib/auth/session";
import { initializeDatabase } from "@/src/lib/db";
import { apiError, apiOk } from "@/src/lib/http/response";
import { ServiceError } from "@/src/lib/http/service-error";
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

    const dataSource = await initializeDatabase();
    const result = await addFavoriteAlbum(dataSource, session.user.id, body);

    return apiOk(
      { favoriteId: result.favoriteId },
      { status: result.created ? 201 : 200 }
    );
  } catch (error) {
    if (error instanceof ServiceError) {
      return apiError(error.message, { status: error.status });
    }
    return apiError(
      error instanceof Error ? error.message : "좋아요 추가 중 오류가 발생했습니다.",
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { session, response } = await requireSessionApi();
    if (response) return response;

    const body = (await request.json()) as { albumId?: string };

    const dataSource = await initializeDatabase();
    await removeFavoriteAlbum(dataSource, session.user.id, body.albumId);

    return apiOk({});
  } catch (error) {
    if (error instanceof ServiceError) {
      return apiError(error.message, { status: error.status });
    }
    return apiError(
      error instanceof Error ? error.message : "좋아요 취소 중 오류가 발생했습니다.",
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { session, response } = await requireSessionApi();
    if (response) return response;

    const dataSource = await initializeDatabase();
    const favorites = await getUserFavoriteAlbums(dataSource, session.user.id);

    return apiOk({ favorites });
  } catch (error) {
    return apiError(
      error instanceof Error
        ? error.message
        : "좋아요한 앨범 목록 조회 중 오류가 발생했습니다.",
      { status: 500 }
    );
  }
}
