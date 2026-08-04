/** GET 장르 트리 */

import { initializeDatabase } from "@/src/lib/db";
import { getGenreTree } from "@/src/lib/genres/genre-service";
import { noStoreJson, publicCachedJson } from "@/src/lib/http/cache";

export async function GET() {
  try {
    const dataSource = await initializeDatabase();
    const genres = await getGenreTree(dataSource);
    return publicCachedJson({ ok: true, genres }, 60, 300);
  } catch (error) {
    return noStoreJson(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "장르 목록을 불러오는 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
