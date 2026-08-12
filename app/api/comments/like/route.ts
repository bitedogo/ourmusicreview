/** POST/GET 댓글 좋아요 토글·상태 */

import { getAppSession, requireSessionApi } from "@/src/lib/auth/session";
import {
  getCommentLikeStatus,
  toggleCommentLike,
} from "@/src/lib/comments/comment-service";
import { initializeDatabase } from "@/src/lib/db";
import { handleRouteError } from "@/src/lib/http/handle-route-error";
import { apiOk } from "@/src/lib/http/response";

export async function POST(request: Request) {
  try {
    const { session, response } = await requireSessionApi();
    if (response) return response;

    const { commentId } = await request.json();
    const dataSource = await initializeDatabase();
    const result = await toggleCommentLike(
      dataSource,
      session.user.id,
      String(commentId ?? "")
    );

    return apiOk(result);
  } catch (error) {
    return handleRouteError(error, "좋아요 처리 중 오류가 발생했습니다.");
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get("commentId") ?? "";
    const dataSource = await initializeDatabase();
    const session = await getAppSession();
    const result = await getCommentLikeStatus(
      dataSource,
      commentId,
      session?.user?.id ?? null
    );

    return apiOk(result);
  } catch (error) {
    return handleRouteError(error, "좋아요 조회 중 오류가 발생했습니다.");
  }
}
