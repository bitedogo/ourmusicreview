/** PATCH 댓글 수정 / DELETE 댓글 삭제 */

import { isAdmin, requireSessionApi, requireWritableSessionApi } from "@/src/lib/auth/session";
import {
  deleteComment,
  updateComment,
} from "@/src/lib/comments/comment-service";
import { initializeDatabase } from "@/src/lib/db";
import { handleRouteError } from "@/src/lib/http/handle-route-error";
import { apiOk } from "@/src/lib/http/response";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { session, response } = await requireWritableSessionApi();
    if (response) return response;

    const body = (await request.json()) as { content?: string };
    const { id } = await params;
    const dataSource = await initializeDatabase();
    const result = await updateComment(
      dataSource,
      id,
      { userId: session.user.id, isAdmin: isAdmin(session) },
      typeof body.content === "string" ? body.content : ""
    );

    return apiOk(result);
  } catch (error) {
    return handleRouteError(error, "댓글 수정 중 오류가 발생했습니다.");
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { session, response } = await requireSessionApi();
    if (response) return response;

    const { id } = await params;
    const dataSource = await initializeDatabase();
    const result = await deleteComment(dataSource, id, {
      userId: session.user.id,
      isAdmin: isAdmin(session),
    });

    return apiOk(result);
  } catch (error) {
    return handleRouteError(error, "댓글 삭제 중 오류가 발생했습니다.");
  }
}
