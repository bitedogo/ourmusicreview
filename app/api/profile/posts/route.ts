/** GET 프로필 게시글 목록 */

import { requireSessionApi } from "@/src/lib/auth/session";
import { initializeDatabase } from "@/src/lib/db";
import { handleRouteError } from "@/src/lib/http/handle-route-error";
import { apiOk } from "@/src/lib/http/response";
import { listMyProfilePosts } from "@/src/lib/profile/profile-content-service";

export async function GET() {
  try {
    const { session, response } = await requireSessionApi();
    if (response) return response;

    const dataSource = await initializeDatabase();
    const posts = await listMyProfilePosts(dataSource, session.user.id);
    return apiOk({ posts });
  } catch (error) {
    return handleRouteError(error, "내 게시글 조회 중 오류가 발생했습니다.");
  }
}
