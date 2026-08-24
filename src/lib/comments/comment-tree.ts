/** 댓글 트리 조작 유틸 */

import type { CommentItemData } from "@/src/components/interaction/comment-types";

export function updateCommentLikeInTree(
  comments: CommentItemData[],
  commentId: string,
  liked: boolean,
  count: number
): CommentItemData[] {
  return comments.map((comment) => {
    if (comment.id === commentId) {
      return { ...comment, liked, likeCount: count };
    }
    return {
      ...comment,
      replies: updateCommentLikeInTree(comment.replies, commentId, liked, count),
    };
  });
}

export function updateCommentContentInTree(
  comments: CommentItemData[],
  commentId: string,
  content: string
): CommentItemData[] {
  return comments.map((comment) => {
    if (comment.id === commentId) {
      return { ...comment, content };
    }
    return {
      ...comment,
      replies: updateCommentContentInTree(comment.replies, commentId, content),
    };
  });
}
