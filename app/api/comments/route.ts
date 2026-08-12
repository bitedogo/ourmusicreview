/** POST/GET 댓글 작성·목록 */

import { getAppSession, requireWritableSessionApi } from "@/src/lib/auth/session";
import {
  createComment,
  listComments,
} from "@/src/lib/comments/comment-service";
import { initializeDatabase } from "@/src/lib/db";
import { handleRouteError } from "@/src/lib/http/handle-route-error";
import { apiOk } from "@/src/lib/http/response";

export async function POST(request: Request) {
  try {
    const { session, response } = await requireWritableSessionApi();
    if (response) return response;

    const body = await request.json();
    const dataSource = await initializeDatabase();
    const comment = await createComment(dataSource, session.user.id, body);

    return apiOk({ comment }, { status: 201 });
  } catch (error) {
    return handleRouteError(error, "댓글 작성 중 오류가 발생했습니다.");
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dataSource = await initializeDatabase();
    const session = await getAppSession();

    const result = await listComments(dataSource, {
      postId: searchParams.get("postId"),
      reviewId: searchParams.get("reviewId"),
      playlistId: searchParams.get("playlistId"),
      viewerUserId: session?.user?.id ?? null,
    });

    return apiOk(result);
  } catch (error) {
    return handleRouteError(error, "댓글 조회 중 오류가 발생했습니다.");
  }
}
