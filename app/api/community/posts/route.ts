/** POST 커뮤니티 게시글 작성 */

import { isAdmin, requireWritableSessionApi } from "@/src/lib/auth/session";
import {
  createCommunityPost,
  type CreateCommunityPostInput,
} from "@/src/lib/community/community-post-service";
import { initializeDatabase } from "@/src/lib/db";
import { handleRouteError } from "@/src/lib/http/handle-route-error";
import { apiError, apiOk } from "@/src/lib/http/response";

export async function POST(request: Request) {
  try {
    const { session, response } = await requireWritableSessionApi();
    if (response) return response;

    if (!session.user.name) {
      return apiError("로그인이 필요합니다.", { status: 401 });
    }

    const body = (await request.json()) as CreateCommunityPostInput;
    const dataSource = await initializeDatabase();
    const result = await createCommunityPost(
      dataSource,
      {
        userId: session.user.id,
        nickname: session.user.name,
        isAdmin: isAdmin(session),
      },
      body
    );

    return apiOk({ id: result.id }, { status: 201 });
  } catch (error) {
    return handleRouteError(error, "게시글 작성 중 오류가 발생했습니다.");
  }
}
