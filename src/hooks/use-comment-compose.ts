"use client";
/** 댓글 작성 상태/제출 공통 훅 */

import { useState } from "react";
import type { CommentTrackData } from "@/src/components/interaction/comment-types";
import { createCommentApi } from "@/src/lib/comments/client-api";
import { getApiErrorMessage } from "@/src/lib/http/client";

interface UseCommentComposeParams {
  postId?: string;
  reviewId?: string;
  playlistId?: string;
  onCreated: () => void | Promise<void>;
}

export function useCommentCompose({
  postId,
  reviewId,
  playlistId,
  onCreated,
}: UseCommentComposeParams) {
  const [content, setContent] = useState("");
  const [track, setTrack] = useState<CommentTrackData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const hasText = Boolean(content.trim());
    const hasTrack = Boolean(track);
    if (isSubmitting || hasText === hasTrack) return;

    setIsSubmitting(true);
    try {
      await createCommentApi(
        hasTrack ? "" : content,
        postId,
        reviewId,
        undefined,
        playlistId,
        hasTrack ? track?.trackId ?? null : null
      );
      setContent("");
      setTrack(null);
      await onCreated();
    } catch (error) {
      alert(getApiErrorMessage(error, "댓글 작성에 실패했습니다."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    content,
    track,
    isSubmitting,
    setContent,
    setTrack,
    submit,
  };
}
