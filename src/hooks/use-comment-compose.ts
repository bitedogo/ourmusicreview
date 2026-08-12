"use client";
/** 댓글 작성 상태/제출 공통 훅 */

import { useState } from "react";
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createCommentApi(content, postId, reviewId, undefined, playlistId);
      setContent("");
      await onCreated();
    } catch (error) {
      alert(getApiErrorMessage(error, "댓글 작성에 실패했습니다."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    content,
    isSubmitting,
    setContent,
    submit,
  };
}
