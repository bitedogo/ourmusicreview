"use client";
/** 게시판 피드 — 목록에서 공감 토글 */

import { useState, type MouseEvent } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { CommentDetailLikeIcon } from "@/src/components/interaction/comment-detail-icons";
import { COMMENT_DETAIL_CLASS as styles } from "@/src/components/interaction/comment-detail-styles";
import {
  buildSigninHref,
  getCurrentReturnPath,
} from "@/src/lib/auth/callback-url";
import { toggleContentLikeApi } from "@/src/lib/engagement/client-api";

interface BoardFeedLikeButtonProps {
  postId: string;
  initialCount: number;
  initialLiked: boolean;
}

export function BoardFeedLikeButton({
  postId,
  initialCount,
  initialLiked,
}: BoardFeedLikeButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [likeInfo, setLikeInfo] = useState({
    count: initialCount,
    liked: initialLiked,
  });
  const [isPending, setIsPending] = useState(false);

  async function handleLike(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (isPending) return;

    if (!session) {
      if (confirm("로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?")) {
        router.push(buildSigninHref(getCurrentReturnPath()));
      }
      return;
    }

    setIsPending(true);
    try {
      const data = await toggleContentLikeApi({ postId });
      setLikeInfo((prev) => ({
        count: data.data.liked ? prev.count + 1 : Math.max(0, prev.count - 1),
        liked: data.data.liked ?? prev.liked,
      }));
    } catch {
      /* 상세와 같이 실패는 조용히 */
    } finally {
      setIsPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={(event) => void handleLike(event)}
      aria-label={likeInfo.liked ? "추천 취소" : "추천"}
      aria-pressed={likeInfo.liked}
      disabled={isPending}
      className={styles.interactionButton}
    >
      <CommentDetailLikeIcon liked={likeInfo.liked} />
      <span className={styles.interactionCount}>{likeInfo.count}</span>
    </button>
  );
}
