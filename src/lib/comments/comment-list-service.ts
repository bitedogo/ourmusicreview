/** 댓글 목록 직렬화·트리 구성 */

import type { Comment } from "@/src/lib/db/entities/Comment";

export interface SerializedComment {
  id: string;
  content: string;
  createdAt: Date;
  parentId: string | null;
  user: {
    id: string;
    nickname: string;
    profileImage: string | null;
  };
  likeCount: number;
  liked: boolean;
  replyCount: number;
  replies: SerializedComment[];
}

export function buildCommentTree(
  comments: Comment[],
  likeCountByCommentId: Map<string, number>,
  likedCommentIds: Set<string>
): SerializedComment[] {
  const nodes = new Map<string, SerializedComment>();

  for (const comment of comments) {
    nodes.set(comment.id, {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      parentId: comment.parentId ?? null,
      user: {
        id: comment.user.id,
        nickname: comment.user.nickname,
        profileImage: comment.user.profileImage ?? null,
      },
      likeCount: likeCountByCommentId.get(comment.id) ?? 0,
      liked: likedCommentIds.has(comment.id),
      replyCount: 0,
      replies: [],
    });
  }

  const roots: SerializedComment[] = [];

  for (const comment of comments) {
    const node = nodes.get(comment.id);
    if (!node) continue;

    if (comment.parentId) {
      const parent = nodes.get(comment.parentId);
      if (parent) {
        parent.replies.push(node);
        parent.replyCount += 1;
      } else {
        roots.push(node);
      }
    } else {
      roots.push(node);
    }
  }

  const sortByCreatedAt = (items: SerializedComment[]) => {
    items.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    for (const item of items) {
      sortByCreatedAt(item.replies);
    }
  };

  sortByCreatedAt(roots);
  return roots;
}

export function countAllComments(comments: SerializedComment[]): number {
  return comments.reduce(
    (sum, comment) => sum + 1 + countAllComments(comment.replies),
    0
  );
}
