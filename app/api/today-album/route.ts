/** GET 오늘의 앨범 */

import { withDatabaseRead } from "@/src/lib/db";
import { noStoreJson, publicCachedJson } from "@/src/lib/http/cache";
import { getTodayAlbums } from "@/src/lib/today-album/today-album-service";
import type { TodayAlbumPayload } from "@/src/lib/today-album/types";

export type { TodayAlbumPayload };

export async function GET() {
  try {
    const result = await withDatabaseRead(getTodayAlbums);
    return publicCachedJson(result, 60, 300);
  } catch (error) {
    return noStoreJson(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "오늘의 앨범 조회 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
