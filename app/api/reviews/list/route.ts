/** GET 리뷰 목록(필터·페이지) */

import { NextRequest } from "next/server";
import { withDatabaseRead } from "@/src/lib/db";
import { noStoreJson, publicCachedJson } from "@/src/lib/http/cache";
import { getReviewList } from "@/src/lib/reviews/review-list-service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const result = await withDatabaseRead((dataSource) =>
      getReviewList(dataSource, {
        sort: searchParams.get("sort"),
        page: searchParams.get("page"),
        searchField: searchParams.get("searchField"),
        q: searchParams.get("q"),
        releaseType: searchParams.get("releaseType"),
      })
    );

    return publicCachedJson({ ok: true, ...result }, 20, 60);
  } catch (error) {
    return noStoreJson(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "리뷰 목록을 불러오는 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
