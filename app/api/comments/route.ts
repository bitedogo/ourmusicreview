import { requireSessionApi } from "@/src/lib/auth/session";
import { initializeDatabase } from "@/src/lib/db";
import { Comment } from "@/src/lib/db/entities/Comment";
import { randomUUID } from "crypto";
import { apiError, apiOk } from "@/src/lib/http/response";

export async function POST(request: Request) {
  try {
    const { session, response } = await requireSessionApi();
    if (response) return response;

    const { content, postId, reviewId } = await request.json();

    if (!content || (!postId && !reviewId)) {
      return apiError("필수 정보가 누락되었습니다.", { status: 400 });
    }

    const dataSource = await initializeDatabase();
    const commentRepository = dataSource.getRepository(Comment);

    const newComment = new Comment();
    newComment.id = randomUUID();
    newComment.content = content;
    newComment.userId = session.user.id;
    newComment.postId = postId ? String(postId) : null;
    newComment.reviewId = reviewId ? String(reviewId) : null;

    await commentRepository.save(newComment);

    return apiOk({ comment: newComment }, { status: 201 });
  } catch {
    return apiError("댓글 작성 중 오류가 발생했습니다.", { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");
    const reviewId = searchParams.get("reviewId");

    if (!postId && !reviewId) {
      return apiError("postId 또는 reviewId가 필요합니다.", { status: 400 });
    }

    const dataSource = await initializeDatabase();
    const commentRepository = dataSource.getRepository(Comment);
    const comments = await commentRepository.find({
      where: postId ? { postId } : { reviewId: reviewId! },
      relations: ["user"],
      order: { createdAt: "ASC" },
    });

    return apiOk({
      comments: comments.map((c) => ({
        id: c.id,
        content: c.content,
        createdAt: c.createdAt,
        user: {
          id: c.user.id,
          nickname: c.user.nickname,
          profileImage: c.user.profileImage,
        },
      })),
    });
  } catch {
    return apiError("댓글 조회 중 오류가 발생했습니다.", { status: 500 });
  }
}
