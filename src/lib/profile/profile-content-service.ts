/** 내 프로필 게시글·댓글·추천·활동 통계 */

import type { DataSource } from "typeorm";
import { IsNull, Not } from "typeorm";
import { Comment } from "@/src/lib/db/entities/Comment";
import { Like } from "@/src/lib/db/entities/Like";
import { Post } from "@/src/lib/db/entities/Post";

export async function getProfileActivityStats(
  dataSource: DataSource,
  userId: string
) {
  const [postCount, commentCount, likedPostCount] = await Promise.all([
    dataSource.getRepository(Post).count({ where: { userId } }),
    dataSource.getRepository(Comment).count({ where: { userId } }),
    dataSource.getRepository(Like).count({
      where: { userId, postId: Not(IsNull()) },
    }),
  ]);

  return { postCount, commentCount, likedPostCount };
}

export async function listMyProfilePosts(
  dataSource: DataSource,
  userId: string
) {
  const postRepository = dataSource.getRepository(Post);
  const commentRepository = dataSource.getRepository(Comment);

  const posts = await postRepository.find({
    where: { userId },
    order: { createdAt: "DESC" },
  });

  return Promise.all(
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
}

export async function listMyProfileComments(
  dataSource: DataSource,
  userId: string
) {
  const comments = await dataSource.getRepository(Comment).find({
    where: { userId },
    relations: ["post", "review", "review.album"],
    order: { createdAt: "DESC" },
  });

  return comments.map((comment) => {
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
  });
}

export async function listMyLikedPosts(
  dataSource: DataSource,
  userId: string
) {
  const likeRepository = dataSource.getRepository(Like);
  const commentRepository = dataSource.getRepository(Comment);

  const likes = await likeRepository.find({
    where: { userId, postId: Not(IsNull()) },
    relations: ["post"],
    order: { createdAt: "DESC" },
  });

  return Promise.all(
    likes
      .filter((like) => Boolean(like.postId && like.post))
      .map(async (like) => {
        const post = like.post!;
        const commentCount = await commentRepository.count({
          where: { postId: post.id },
        });
        return {
          likeId: like.id,
          likedAt: like.createdAt,
          id: post.id,
          title: post.title,
          category: post.category,
          isGlobal: post.isGlobal,
          createdAt: post.createdAt,
          commentCount,
        };
      })
  );
}
