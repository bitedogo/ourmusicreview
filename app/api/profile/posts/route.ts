import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth/config";
import { initializeDatabase } from "@/src/lib/db";
import { Comment } from "@/src/lib/db/entities/Comment";
import { Post } from "@/src/lib/db/entities/Post";
import { apiError, apiOk } from "@/src/lib/http/response";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return apiError("로그인이 필요합니다.", { status: 401 });
    }

    const dataSource = await initializeDatabase();
    const postRepository = dataSource.getRepository(Post);
    const commentRepository = dataSource.getRepository(Comment);

    const posts = await postRepository.find({
      where: { userId: session.user.id },
      order: { createdAt: "DESC" },
    });

    const postsWithCommentCount = await Promise.all(
      posts.map(async (post) => {
        const commentCount = await commentRepository.count({
          where: { postId: post.id },
        });

        return {
          id: post.id,
          title: post.title,
          category: post.category,
          isGlobal: post.isGlobal,
          createdAt: post.createdAt,
          commentCount,
        };
      })
    );

    return apiOk({ posts: postsWithCommentCount });
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "내 게시글 조회 중 오류가 발생했습니다.",
      { status: 500 }
    );
  }
}
