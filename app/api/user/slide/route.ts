/** GET/POST/DELETE/PATCH 유저 슬라이드 앨범(명반) */

import { requireSessionApi } from "@/src/lib/auth/session";
import { initializeDatabase } from "@/src/lib/db";
import { apiError, apiOk } from "@/src/lib/http/response";
import { ServiceError } from "@/src/lib/http/service-error";
import {
  addUserSlideAlbum,
  listUserSlideAlbums,
  removeUserSlideAlbum,
  reorderUserSlideAlbums,
} from "@/src/lib/slides/user-slide-service";

export async function GET() {
  const { session, response } = await requireSessionApi();
  if (response) return response;

  try {
    const dataSource = await initializeDatabase();
    const result = await listUserSlideAlbums(dataSource, session.user.id);

    return apiOk(result);
  } catch (err) {
    return apiError(
      err instanceof Error ? err.message : "목록 조회 중 오류가 발생했습니다.",
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const { session, response } = await requireSessionApi();
  if (response) return response;

  try {
    const body = await request.json();
    const collectionId = String(body.collectionId ?? "");

    const dataSource = await initializeDatabase();
    const album = await addUserSlideAlbum(dataSource, session.user.id, collectionId);

    return apiOk({ album }, { status: 201, message: "추가되었습니다." });
  } catch (err) {
    if (err instanceof ServiceError) {
      return apiError(err.message, { status: err.status });
    }
    return apiError(
      err instanceof Error ? err.message : "추가 중 오류가 발생했습니다.",
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const { session, response } = await requireSessionApi();
  if (response) return response;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id") ?? "";

    const dataSource = await initializeDatabase();
    await removeUserSlideAlbum(dataSource, session.user.id, id);

    return apiOk({}, { message: "삭제되었습니다." });
  } catch (err) {
    if (err instanceof ServiceError) {
      return apiError(err.message, { status: err.status });
    }
    return apiError(
      err instanceof Error ? err.message : "삭제 중 오류가 발생했습니다.",
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const { session, response } = await requireSessionApi();
  if (response) return response;

  try {
    const body = await request.json();

    const dataSource = await initializeDatabase();
    await reorderUserSlideAlbums(dataSource, session.user.id, body.order);

    return apiOk({}, { message: "순서가 저장되었습니다." });
  } catch (err) {
    if (err instanceof ServiceError) {
      return apiError(err.message, { status: err.status });
    }
    return apiError(
      err instanceof Error ? err.message : "순서 저장 중 오류가 발생했습니다.",
      { status: 500 }
    );
  }
}
