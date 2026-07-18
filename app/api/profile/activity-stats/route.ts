/** GET 프로필 활동 통계 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth/config";
import { initializeDatabase } from "@/src/lib/db";
import { Comment } from "@/src/lib/db/entities/Comment";
import { Like } from "@/src/lib/db/entities/Like";
import { Post } from "@/src/lib/db/entities/Post";
import { apiError, apiOk } from "@/src/lib/http/response";
import { IsNull, Not } from "typeorm";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiError("로그인이 필요합니다.", { status: 401 });
    }

    const userId = session.user.id;
    const dataSource = await initializeDatabase();
    const postRepository = dataSource.getRepository(Post);
    const commentRepository = dataSource.getRepository(Comment);
    const likeRepository = dataSource.getRepository(Like);

    const [postCount, commentCount, likedPostCount] = await Promise.all([
      postRepository.count({ where: { userId } }),
      commentRepository.count({ where: { userId } }),
      likeRepository.count({
        where: { userId, postId: Not(IsNull()) },
      }),
    ]);

    return apiOk({
      postCount,
      commentCount,
      likedPostCount,
    });
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "활동 통계 조회 중 오류가 발생했습니다.",
      { status: 500 }
    );
  }
}
