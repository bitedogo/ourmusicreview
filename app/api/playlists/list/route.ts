/** GET 공개 플레이리스트 목록(검색·페이지) */

import { NextRequest } from "next/server";
import { initializeDatabase } from "@/src/lib/db";
import { noStoreJson, publicCachedJson } from "@/src/lib/http/cache";
import { ServiceError } from "@/src/lib/http/service-error";
import { listPublicPlaylists } from "@/src/lib/playlists/playlist-service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dataSource = await initializeDatabase();

    const result = await listPublicPlaylists(dataSource, {
      page: searchParams.get("page"),
      searchField: searchParams.get("searchField"),
      q: searchParams.get("q"),
      genre: searchParams.get("genre"),
    });

    return publicCachedJson({ ok: true, ...result }, 20, 60);
  } catch (error) {
    if (error instanceof ServiceError) {
      return noStoreJson(
        { ok: false, error: error.message },
        { status: error.status }
      );
    }
    return noStoreJson(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "플레이리스트 목록을 불러오는 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
