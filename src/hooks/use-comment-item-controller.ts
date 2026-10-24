"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { CommentTrackData } from "@/src/components/interaction/comment-types";
import { useCommentEdit } from "@/src/hooks/use-comment-edit";
import { ensureLoggedIn } from "@/src/lib/interaction/require-login";
import {
  buildSigninHref,
  getCurrentReturnPath,
} from "@/src/lib/auth/callback-url";

interface UseCommentItemControllerOptions {
  commentId: string;
  initialContent: string;
  initialTrack: CommentTrackData | null;
  authorId: string;
  depth: number;
  currentUserId?: string;
  isAdmin?: boolean;
  isLoggedIn: boolean;
  onEdit: (
    commentId: string,
    content: string,
    trackId: string | null
  ) => Promise<boolean>;
  onLike: (commentId: string) => void;
  onReply: (
    parentId: string,
    content: string,
    trackId: string | null
  ) => Promise<boolean>;
}

export function useCommentItemController({
  commentId,
  initialContent,
  initialTrack,
  authorId,
  depth,
  currentUserId,
  isAdmin,
  isLoggedIn,
  onEdit,
  onLike,
  onReply,
}: UseCommentItemControllerOptions) {
  const router = useRouter();
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [replyTrack, setReplyTrack] = useState<CommentTrackData | null>(null);
  const [isReplySubmitting, setIsReplySubmitting] = useState(false);
  const edit = useCommentEdit({ initialContent, initialTrack, commentId, onEdit });

  const isOwner = currentUserId === authorId;
  const canDelete = isOwner || Boolean(isAdmin);
  const canEdit = isOwner || Boolean(isAdmin);
  const canReply = depth === 0;

  function handleLikeClick() {
    if (!ensureLoggedIn(isLoggedIn, () => router.push(buildSigninHref(getCurrentReturnPath())))) return;
    onLike(commentId);
  }

  function handleReplyClick() {
    if (!ensureLoggedIn(isLoggedIn, () => router.push(buildSigninHref(getCurrentReturnPath())))) return;
    setIsReplying((previous) => !previous);
  }

  async function handleReplySubmit(event: FormEvent) {
    event.preventDefault();
    const hasText = Boolean(replyContent.trim());
    const hasTrack = Boolean(replyTrack);
    if (isReplySubmitting || hasText === hasTrack) return;

    setIsReplySubmitting(true);
    try {
      const ok = await onReply(
        commentId,
        hasTrack ? "" : replyContent,
        hasTrack ? replyTrack?.trackId ?? null : null
      );
      if (ok) {
        setReplyContent("");
        setReplyTrack(null);
        setIsReplying(false);
      }
    } finally {
      setIsReplySubmitting(false);
    }
  }

  return {
    ...edit,
    isOwner,
    canDelete,
    canEdit,
    canReply,
    isReplying,
    replyContent,
    replyTrack,
    isReplySubmitting,
    setReplyContent,
    setReplyTrack,
    handleLikeClick,
    handleReplyClick,
    handleReplySubmit,
  };
}
