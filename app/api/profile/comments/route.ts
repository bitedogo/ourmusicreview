import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth/config";
import { initializeDatabase } from "@/src/lib/db";
import { Comment } from "@/src/lib/db/entities/Comment";
import { apiError, apiOk } from "@/src/lib/http/response";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return apiError("로그인이 필요합니다.", { status: 401 });
    }

    const dataSource = await initializeDatabase();
    const commentRepository = dataSource.getRepository(Comment);

    const comments = await commentRepository.find({
      where: { userId: session.user.id },
      relations: ["post", "review", "review.album"],
      order: { createdAt: "DESC" },
    });

    return apiOk({
      comments: comments.map((comment) => {
        const hasPost = Boolean(comment.postId && comment.post);
        const hasReview = Boolean(comment.reviewId && comment.review);

        return {
          id: comment.id,
          content: comment.content,
          createdAt: comment.createdAt,
          targetType: hasPost ? "BOARD" : hasReview ? "REVIEW" : "UNKNOWN",
          post: hasPost
            ? {
                id: comment.post!.id,
                title: comment.post!.title,
                category: comment.post!.category,
              }
            : null,
          review: hasReview
            ? {
                id: comment.review!.id,
                albumId: comment.review!.albumId,
                albumTitle: comment.review!.album?.title ?? null,
                albumArtist: comment.review!.album?.artist ?? null,
              }
            : null,
        };
      }),
    });
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "내 댓글 조회 중 오류가 발생했습니다.",
      { status: 500 }
    );
  }
}
