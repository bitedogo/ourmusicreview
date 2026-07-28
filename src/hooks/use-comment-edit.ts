"use client";
/** 댓글 수정 상태/동작 공통 훅 */

import { useState } from "react";

interface UseCommentEditParams {
  initialContent: string;
  commentId: string;
  onEdit: (commentId: string, content: string) => Promise<boolean>;
}

export function useCommentEdit({
  initialContent,
  commentId,
  onEdit,
}: UseCommentEditParams) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);

  const startEdit = () => {
    setDraft(initialContent);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setDraft(initialContent);
    setIsEditing(false);
  };

  const saveEdit = async () => {
    const next = draft.trim();
    if (!next || isSaving) return;
    setIsSaving(true);
    try {
      const ok = await onEdit(commentId, next);
      if (ok) setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isEditing,
    draft,
    isSaving,
    setDraft,
    startEdit,
    cancelEdit,
    saveEdit,
  };
}
