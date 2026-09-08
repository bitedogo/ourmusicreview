/** GET Featured 앨범 슬라이드 */

import { getAppSession } from "@/src/lib/auth/session";
import { withDatabaseRead } from "@/src/lib/db";
import { getFeaturedAlbums } from "@/src/lib/featured-albums/featured-album-service";
import { apiError, apiOk } from "@/src/lib/http/response";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const forceAdmin = searchParams.get("source") === "admin";

    const session = await getAppSession();
    const userId = session?.user?.id;

    const result = await withDatabaseRead((dataSource) =>
      getFeaturedAlbums(dataSource, { userId, forceAdmin })
    );
    return apiOk(result);
  } catch (error) {
    return apiError(
      error instanceof Error
        ? error.message
        : "명반 목록 조회 중 오류가 발생했습니다.",
      { status: 500 }
    );
  }
}
