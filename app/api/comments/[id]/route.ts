/** PATCH 댓글 수정 / DELETE 댓글 삭제 */

import { isAdmin, requireSessionApi } from "@/src/lib/auth/session";
import { initializeDatabase } from "@/src/lib/db";
import { Comment } from "@/src/lib/db/entities/Comment";
import { apiError, apiOk } from "@/src/lib/http/response";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { session, response } = await requireSessionApi();
    if (response) return response;

    const body = (await request.json()) as { content?: string };
    const content =
      typeof body.content === "string" ? body.content.trim() : "";
    if (!content) {
      return apiError("댓글 내용을 입력해주세요.", { status: 400 });
    }

    const dataSource = await initializeDatabase();
    const { id } = await params;
    const commentRepository = dataSource.getRepository(Comment);
    const comment = await commentRepository.findOne({ where: { id } });

    if (!comment) {
      return apiError("댓글을 찾을 수 없습니다.", { status: 404 });
    }

    if (comment.userId !== session.user.id) {
      return apiError("수정 권한이 없습니다.", { status: 403 });
    }

    comment.content = content;
    await commentRepository.save(comment);

    return apiOk({ id: comment.id, content: comment.content });
  } catch {
    return apiError("댓글 수정 중 오류가 발생했습니다.", { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { session, response } = await requireSessionApi();
    if (response) return response;

    const dataSource = await initializeDatabase();
    const { id } = await params;
    const commentRepository = dataSource.getRepository(Comment);
    const comment = await commentRepository.findOne({
      where: { id },
    });

    if (!comment) {
      return apiError("댓글을 찾을 수 없습니다.", { status: 404 });
    }

    if (comment.userId !== session.user.id && !isAdmin(session)) {
      return apiError("삭제 권한이 없습니다.", { status: 403 });
    }

    await commentRepository.remove(comment);

    return apiOk({ id: comment.id });
  } catch {
    return apiError("댓글 삭제 중 오류가 발생했습니다.", { status: 500 });
  }
}
