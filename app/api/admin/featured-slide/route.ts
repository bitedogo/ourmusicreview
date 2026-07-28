/** GET/POST/PATCH/DELETE 관리자 Featured 슬라이드 */

import { requireAdminApi } from "@/src/lib/auth/session";
import { initializeDatabase } from "@/src/lib/db";
import { apiError, apiOk } from "@/src/lib/http/response";
import { ServiceError } from "@/src/lib/http/service-error";
import {
  addFeaturedSlideAlbum,
  listFeaturedSlideAlbums,
  removeFeaturedSlideAlbum,
  reorderFeaturedSlideAlbums,
} from "@/src/lib/slides/featured-slide-service";

export async function GET() {
  const { response } = await requireAdminApi();
  if (response) return response;

  try {
    const dataSource = await initializeDatabase();
    const result = await listFeaturedSlideAlbums(dataSource);

    return apiOk(result);
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "목록 조회 중 오류가 발생했습니다.",
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const { response } = await requireAdminApi();
  if (response) return response;

  try {
    const body = await request.json();
    const collectionId = String(body.collectionId ?? "");

    const dataSource = await initializeDatabase();
    const album = await addFeaturedSlideAlbum(dataSource, collectionId);

    return apiOk({ album }, { status: 201, message: "추가되었습니다." });
  } catch (error) {
    if (error instanceof ServiceError) {
      return apiError(error.message, { status: error.status });
    }
    return apiError(
      error instanceof Error ? error.message : "추가 중 오류가 발생했습니다.",
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const { response } = await requireAdminApi();
  if (response) return response;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id") ?? "";

    const dataSource = await initializeDatabase();
    await removeFeaturedSlideAlbum(dataSource, id);

    return apiOk({}, { message: "삭제되었습니다." });
  } catch (error) {
    if (error instanceof ServiceError) {
      return apiError(error.message, { status: error.status });
    }
    return apiError(
      error instanceof Error ? error.message : "삭제 중 오류가 발생했습니다.",
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const { response } = await requireAdminApi();
  if (response) return response;

  try {
    const body = await request.json();

    const dataSource = await initializeDatabase();
    await reorderFeaturedSlideAlbums(dataSource, body.order);

    return apiOk({}, { message: "순서가 저장되었습니다." });
  } catch (error) {
    if (error instanceof ServiceError) {
      return apiError(error.message, { status: error.status });
    }
    return apiError(
      error instanceof Error ? error.message : "순서 저장 중 오류가 발생했습니다.",
      { status: 500 }
    );
  }
}
