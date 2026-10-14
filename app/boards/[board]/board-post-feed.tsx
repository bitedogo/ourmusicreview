/** 게시판 글 목록 — 피드형 카드 */

import type { ReactNode } from "react";
import Link from "next/link";
import { CommentDetailReplyIcon } from "@/src/components/interaction/comment-detail-icons";
import { COMMENT_DETAIL_CLASS as styles } from "@/src/components/interaction/comment-detail-styles";
import { getUserProfilePath } from "@/src/components/profile/user-profile-view";
import type { BoardListPostItem } from "@/src/lib/community/board-post-service";
import { communityDetail } from "@/src/lib/navigation/routes";
import { formatRelativeTimeKo } from "@/src/lib/utils/date";
import { getHtmlPlainText } from "@/src/lib/utils/editor";
import { BoardFeedAvatar } from "./board-feed-avatar";
import { BoardFeedExcerpt } from "./board-feed-excerpt";
import { BoardFeedLikeButton } from "./board-feed-like-button";

interface BoardPostFeedProps {
  posts: BoardListPostItem[];
  composer?: ReactNode;
}

function BoardPostCard({ post }: { post: BoardListPostItem }) {
  const href = communityDetail(post.id);
  const excerptHtml = post.excerptHtml.trim();
  const showExcerpt =
    Boolean(excerptHtml) &&
    getHtmlPlainText(excerptHtml) !== post.title.trim();

  return (
    <article
      className={`grid grid-cols-[36px_minmax(0,1fr)] gap-2.5 px-1 py-3.5 sm:px-2 ${
        post.isPinned ? "bg-zinc-50/80" : ""
      }`}
    >
      <BoardFeedAvatar
        userId={post.userId}
        nickname={post.nickname}
        profileImage={post.profileImage}
      />
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-1.5 text-[13px]">
          <Link
            href={getUserProfilePath(post.userId)}
            className="font-semibold text-[var(--color-text-primary)] hover:underline"
          >
            {post.nickname}
          </Link>
          {post.isPinned ? (
            <span className="text-[12px] font-medium text-red-600">공지</span>
          ) : null}
          <time
            dateTime={post.createdAt.toISOString()}
            className="text-[12px] text-[var(--color-text-muted)]"
          >
            {formatRelativeTimeKo(post.createdAt)}
          </time>
        </div>

        <Link href={href} className="mt-1 block">
          <h2 className="text-[16px] font-semibold leading-snug tracking-tight text-[var(--color-text-primary)]">
            {post.title}
          </h2>
        </Link>
        {showExcerpt ? (
          <BoardFeedExcerpt html={excerptHtml} href={href} />
        ) : null}
        {post.imageUrl ? (
          <Link href={href} className="mt-2.5 block overflow-hidden rounded-[15px] bg-zinc-100">
            <img
              src={post.imageUrl}
              alt=""
              className="max-h-72 w-full object-cover"
            />
          </Link>
        ) : null}
        <div className={`${styles.interactionBar} mt-2.5`}>
          <BoardFeedLikeButton
            postId={post.id}
            initialCount={post.likeCount}
            initialLiked={post.liked}
          />
          <Link
            href={href}
            className={styles.interactionButton}
            aria-label={`댓글 ${post.commentCount}`}
          >
            <CommentDetailReplyIcon />
            <span className={styles.interactionCount}>{post.commentCount}</span>
          </Link>
        </div>
      </div>
    </article>
  );
}

export function BoardPostFeed({ posts, composer }: BoardPostFeedProps) {
  return (
    <div className="divide-y divide-zinc-100 border-y border-zinc-100">
      {composer}
      {posts.map((post) => (
        <BoardPostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
