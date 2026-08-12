/** POST/GET 좋아요 토글·상태 */

import { getAppSession, requireSessionApi } from "@/src/lib/auth/session";
import { initializeDatabase } from "@/src/lib/db";
import {
  getContentLikeStatus,
  resolveContentLikeTarget,
  toggleContentLike,
} from "@/src/lib/engagement/content-like-service";
import { handleRouteError } from "@/src/lib/http/handle-route-error";
import { apiOk } from "@/src/lib/http/response";

export async function POST(request: Request) {
  try {
    const { session, response } = await requireSessionApi();
    if (response) return response;

    const body = await request.json();
    const target = resolveContentLikeTarget(body);
    const dataSource = await initializeDatabase();
    const result = await toggleContentLike(
      dataSource,
      session.user.id,
      target
    );

    return apiOk(result);
  } catch (error) {
    return handleRouteError(error, "좋아요 처리 중 오류가 발생했습니다.");
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const target = resolveContentLikeTarget({
      postId: searchParams.get("postId"),
      reviewId: searchParams.get("reviewId"),
      playlistId: searchParams.get("playlistId"),
    });

    const dataSource = await initializeDatabase();
    const session = await getAppSession();
    const result = await getContentLikeStatus(
      dataSource,
      target,
      session?.user?.id ?? null
    );

    return apiOk(result);
  } catch (error) {
    return handleRouteError(error, "좋아요 조회 중 오류가 발생했습니다.");
  }
}
