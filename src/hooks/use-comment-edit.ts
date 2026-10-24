"use client";
/** 댓글 수정 상태/동작 공통 훅 */

import { useState } from "react";
import type { CommentTrackData } from "@/src/components/interaction/comment-types";

interface UseCommentEditParams {
  initialContent: string;
  initialTrack: CommentTrackData | null;
  commentId: string;
  onEdit: (
    commentId: string,
    content: string,
    trackId: string | null
  ) => Promise<boolean>;
}

export function useCommentEdit({
  initialContent,
  initialTrack,
  commentId,
  onEdit,
}: UseCommentEditParams) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(initialContent);
  const [draftTrack, setDraftTrack] = useState<CommentTrackData | null>(initialTrack);
  const [isSaving, setIsSaving] = useState(false);

  const startEdit = () => {
    setDraft(initialContent);
    setDraftTrack(initialTrack);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setDraft(initialContent);
    setDraftTrack(initialTrack);
    setIsEditing(false);
  };

  const saveEdit = async () => {
    const next = draft.trim();
    const hasText = Boolean(next);
    const hasTrack = Boolean(draftTrack);
    if (isSaving || hasText === hasTrack) return;
    setIsSaving(true);
    try {
      const ok = await onEdit(
        commentId,
        hasTrack ? "" : next,
        hasTrack ? draftTrack?.trackId ?? null : null
      );
      if (ok) setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isEditing,
    draft,
    draftTrack,
    isSaving,
    setDraft,
    setDraftTrack,
    startEdit,
    cancelEdit,
    saveEdit,
  };
}
