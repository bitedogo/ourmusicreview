"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useCommentEdit } from "@/src/hooks/use-comment-edit";
import { ensureLoggedIn } from "@/src/lib/interaction/require-login";
import {
  buildSigninHref,
  getCurrentReturnPath,
} from "@/src/lib/auth/callback-url";

interface UseCommentItemControllerOptions {
  commentId: string;
  initialContent: string;
  authorId: string;
  depth: number;
  currentUserId?: string;
  isAdmin?: boolean;
  isLoggedIn: boolean;
  onEdit: (commentId: string, content: string) => Promise<boolean>;
  onLike: (commentId: string) => void;
  onReply: (parentId: string, content: string) => Promise<boolean>;
}

export function useCommentItemController({
  commentId,
  initialContent,
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
  const [isReplySubmitting, setIsReplySubmitting] = useState(false);
  const edit = useCommentEdit({ initialContent, commentId, onEdit });

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
    if (!replyContent.trim() || isReplySubmitting) return;

    setIsReplySubmitting(true);
    try {
      const ok = await onReply(commentId, replyContent);
      if (ok) {
        setReplyContent("");
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
    isReplySubmitting,
    setReplyContent,
    handleLikeClick,
    handleReplyClick,
    handleReplySubmit,
  };
}
