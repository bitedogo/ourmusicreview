/** GET/PATCH/DELETE 커뮤니티 게시글 상세·수정·삭제 */

import { isAdmin, requireSessionApi, requireWritableSessionApi } from "@/src/lib/auth/session";
import {
  deleteCommunityPost,
  getCommunityPost,
  updateCommunityPost,
  type UpdateCommunityPostInput,
} from "@/src/lib/community/community-post-service";
import { initializeDatabase } from "@/src/lib/db";
import { handleRouteError } from "@/src/lib/http/handle-route-error";
import { apiOk } from "@/src/lib/http/response";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { session, response } = await requireWritableSessionApi();
    if (response) return response;

    const body = (await request.json()) as UpdateCommunityPostInput;
    const dataSource = await initializeDatabase();
    const post = await updateCommunityPost(
      dataSource,
      id,
      { userId: session.user.id, isAdmin: isAdmin(session) },
      body
    );

    return apiOk({ post });
  } catch (error) {
    return handleRouteError(error, "게시글 수정 중 오류가 발생했습니다.");
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { session, response } = await requireSessionApi();
    if (response) return response;

    const dataSource = await initializeDatabase();
    await deleteCommunityPost(dataSource, id, {
      userId: session.user.id,
      isAdmin: isAdmin(session),
    });

    return apiOk({});
  } catch (error) {
    return handleRouteError(error, "게시글 삭제 중 오류가 발생했습니다.");
  }
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const dataSource = await initializeDatabase();
    const post = await getCommunityPost(dataSource, id);
    return apiOk({ post });
  } catch (error) {
    return handleRouteError(error, "게시글 조회 중 오류가 발생했습니다.");
  }
}
