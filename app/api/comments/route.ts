/** POST/GET 댓글 작성·목록 */

import { getAppSession, requireSessionApi } from "@/src/lib/auth/session";
import {
  buildCommentTree,
  countAllComments,
} from "@/src/lib/comments/comment-list-service";
import { initializeDatabase } from "@/src/lib/db";
import { Comment } from "@/src/lib/db/entities/Comment";
import { Like } from "@/src/lib/db/entities/Like";
import { randomUUID } from "crypto";
import { In } from "typeorm";
import { apiError, apiOk } from "@/src/lib/http/response";

export async function POST(request: Request) {
  try {
    const { session, response } = await requireSessionApi();
    if (response) return response;

    const { content, postId, reviewId, playlistId, parentId } =
      await request.json();

    if (!content || (!postId && !reviewId && !playlistId)) {
      return apiError("필수 정보가 누락되었습니다.", { status: 400 });
    }

    const dataSource = await initializeDatabase();
    const commentRepository = dataSource.getRepository(Comment);

    let resolvedPostId = postId ? String(postId) : null;
    let resolvedReviewId = reviewId ? String(reviewId) : null;
    let resolvedPlaylistId = playlistId ? String(playlistId) : null;

    if (parentId) {
      const parent = await commentRepository.findOne({
        where: { id: String(parentId) },
      });
      if (!parent) {
        return apiError("원본 댓글을 찾을 수 없습니다.", { status: 404 });
      }
      if (parent.parentId) {
        return apiError("대댓글에는 답글을 달 수 없습니다.", { status: 400 });
      }
      resolvedPostId = parent.postId ?? null;
      resolvedReviewId = parent.reviewId ?? null;
      resolvedPlaylistId = parent.playlistId ?? null;
    }

    const newComment = new Comment();
    newComment.id = randomUUID();
    newComment.content = String(content).trim();
    newComment.userId = session.user.id;
    newComment.postId = resolvedPostId;
    newComment.reviewId = resolvedReviewId;
    newComment.playlistId = resolvedPlaylistId;
    newComment.parentId = parentId ? String(parentId) : null;

    if (!newComment.content) {
      return apiError("댓글 내용을 입력해주세요.", { status: 400 });
    }

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
    const playlistId = searchParams.get("playlistId");

    if (!postId && !reviewId && !playlistId) {
      return apiError("postId, reviewId 또는 playlistId가 필요합니다.", {
        status: 400,
      });
    }

    const dataSource = await initializeDatabase();
    const session = await getAppSession();
    const commentRepository = dataSource.getRepository(Comment);
    const likeRepository = dataSource.getRepository(Like);

    const comments = await commentRepository.find({
      where: postId
        ? { postId }
        : reviewId
          ? { reviewId }
          : { playlistId: playlistId! },
      relations: ["user"],
      order: { createdAt: "ASC" },
    });

    const commentIds = comments.map((comment) => comment.id);
    const likeCountByCommentId = new Map<string, number>();
    const likedCommentIds = new Set<string>();

    if (commentIds.length > 0) {
      const likeRows = await likeRepository
        .createQueryBuilder("like")
        .select("like.comment_id", "commentId")
        .addSelect("COUNT(*)", "count")
        .where("like.comment_id IN (:...commentIds)", { commentIds })
        .groupBy("like.comment_id")
        .getRawMany<{ commentId: string; count: string }>();

      for (const row of likeRows) {
        likeCountByCommentId.set(row.commentId, Number(row.count));
      }

      if (session?.user?.id) {
        const myLikes = await likeRepository.find({
          where: {
            userId: session.user.id,
            commentId: In(commentIds),
          },
          select: ["commentId"],
        });
        for (const like of myLikes) {
          if (like.commentId) likedCommentIds.add(like.commentId);
        }
      }
    }

    const tree = buildCommentTree(
      comments,
      likeCountByCommentId,
      likedCommentIds
    );

    return apiOk({
      comments: tree,
      totalCount: countAllComments(tree),
    });
  } catch {
    return apiError("댓글 조회 중 오류가 발생했습니다.", { status: 500 });
  }
}
