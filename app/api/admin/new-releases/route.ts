/** GET/POST/DELETE 관리자 주간 신보 */

import { requireAdminApi } from "@/src/lib/auth/session";
import { initializeDatabase } from "@/src/lib/db";
import { apiError, apiOk } from "@/src/lib/http/response";
import { parseJsonBody, parseSearchParams } from "@/src/lib/http/schema";
import { ServiceError } from "@/src/lib/http/service-error";
import {
  addNewReleaseInputSchema,
  removeNewReleaseInputSchema,
} from "@/src/lib/new-releases/contracts";
import {
  addManualNewReleaseAlbum,
  addNewReleaseAlbum,
  listAdminNewReleases,
  removeNewReleaseAlbum,
} from "@/src/lib/new-releases/new-release-service";

export async function GET() {
  const { response } = await requireAdminApi();
  if (response) return response;

  try {
    const dataSource = await initializeDatabase();
    const result = await listAdminNewReleases(dataSource);
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
    const body = await parseJsonBody(request, addNewReleaseInputSchema);
    const dataSource = await initializeDatabase();
    const album =
      "collectionId" in body
        ? await addNewReleaseAlbum(dataSource, body.collectionId)
        : await addManualNewReleaseAlbum(dataSource, body);

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
    const { id } = parseSearchParams(searchParams, removeNewReleaseInputSchema);

    const dataSource = await initializeDatabase();
    await removeNewReleaseAlbum(dataSource, id);

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
