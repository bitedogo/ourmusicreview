"use client";
/** ��� �� �� (default / detail) */

import { useState } from "react";
import Link from "next/link";
import { CommentAvatar } from "@/src/components/interaction/comment-avatar";
import { CommentDetailItem } from "@/src/components/interaction/CommentDetailItem";
import { CommentReplyForm } from "@/src/components/interaction/CommentReplyForm";
import { getUserProfilePath } from "@/src/components/profile/user-profile-view";
import type { CommentItemData } from "@/src/components/interaction/comment-types";
import { useCommentEdit } from "@/src/hooks/use-comment-edit";
import { ensureLoggedIn } from "@/src/lib/interaction/require-login";

const DEFAULT_ACTION_CLASS =
  "shrink-0 text-[12px] font-normal leading-[14px] text-[#D9D9D9] transition hover:text-[var(--color-text-secondary)]";

interface CommentItemProps {
  comment: CommentItemData;
  variant: "default" | "detail";
  depth?: number;
  currentUserId?: string;
  isAdmin?: boolean;
  isLoggedIn: boolean;
  isReply?: boolean;
  onDelete: (commentId: string) => void;
  onEdit: (commentId: string, content: string) => Promise<boolean>;
  onLike: (commentId: string) => void;
  onReply: (parentId: string, content: string) => Promise<boolean>;
}

export function CommentItem({
  comment,
  variant,
  depth = 0,
  currentUserId,
  isAdmin,
  isLoggedIn,
  isReply = false,
  onDelete,
  onEdit,
  onLike,
  onReply,
}: CommentItemProps) {
  if (variant === "detail") {
    return (
      <CommentDetailItem
        comment={comment}
        depth={depth}
        currentUserId={currentUserId}
        isAdmin={isAdmin}
        isLoggedIn={isLoggedIn}
        isReply={isReply}
        onDelete={onDelete}
        onEdit={onEdit}
        onLike={onLike}
        onReply={onReply}
      />
    );
  }

  return (
    <DefaultCommentItem
      comment={comment}
      depth={depth}
      currentUserId={currentUserId}
      isAdmin={isAdmin}
      isLoggedIn={isLoggedIn}
      isReply={isReply}
      onDelete={onDelete}
      onEdit={onEdit}
      onLike={onLike}
      onReply={onReply}
    />
  );
}

function DefaultCommentItem({
  comment,
  depth = 0,
  currentUserId,
  isAdmin,
  isLoggedIn,
  isReply = false,
  onDelete,
  onEdit,
  onLike,
  onReply,
}: Omit<CommentItemProps, "variant">) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isReplySubmitting, setIsReplySubmitting] = useState(false);

  const isOwner = currentUserId === comment.user.id;
  const canDelete = isOwner || Boolean(isAdmin);
  const canReply = depth === 0;

  const { isEditing, draft, isSaving, setDraft, startEdit, cancelEdit, saveEdit } =
    useCommentEdit({
      initialContent: comment.content,
      commentId: comment.id,
      onEdit,
    });

  const handleLikeClick = () => {
    if (!ensureLoggedIn(isLoggedIn)) return;
    onLike(comment.id);
  };

  const handleReplyClick = () => {
    if (!ensureLoggedIn(isLoggedIn)) return;
    setIsReplying((prev) => !prev);
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || isReplySubmitting) return;

    setIsReplySubmitting(true);
    try {
      const ok = await onReply(comment.id, replyContent);
      if (ok) {
        setReplyContent("");
        setIsReplying(false);
      }
    } finally {
      setIsReplySubmitting(false);
    }
  };

  const ownerActions =
    isOwner || canDelete ? (
      <span className="inline-flex items-center gap-[7px]">
        {isOwner ? (
          <button type="button" onClick={startEdit} className={DEFAULT_ACTION_CLASS}>
            ����
          </button>
        ) : null}
        {canDelete ? (
          <button
            type="button"
            onClick={() => onDelete(comment.id)}
            className={DEFAULT_ACTION_CLASS}
          >
            ����
          </button>
        ) : null}
      </span>
    ) : null;

  const replyList =
    comment.replies.length > 0 ? (
      <div className="mt-4 space-y-4">
        {comment.replies.map((reply) => (
          <CommentItem
            key={reply.id}
            comment={reply}
            variant="default"
            depth={depth + 1}
            currentUserId={currentUserId}
            isAdmin={isAdmin}
            isLoggedIn={isLoggedIn}
            isReply
            onDelete={onDelete}
            onEdit={onEdit}
            onLike={onLike}
            onReply={onReply}
          />
        ))}
      </div>
    ) : null;

  return (
    <div className={isReply ? "ml-10" : undefined}>
      <div className="flex gap-4">
        <CommentAvatar user={comment.user} size="default" />
        <div className="flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={getUserProfilePath(comment.user.id)}
              className="text-xs font-bold text-[var(--color-text-primary)] hover:underline"
            >
              {comment.user.nickname}
            </Link>
            <span className="text-[12px] font-normal leading-[14px] text-[#D9D9D9]">
              {new Date(comment.createdAt).toLocaleDateString("ko-KR")}
            </span>
            {!isEditing ? <span className="ml-[24px]">{ownerActions}</span> : null}
          </div>

          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={3}
                className="min-h-[80px] w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm outline-none focus:border-zinc-400"
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={cancelEdit} className={DEFAULT_ACTION_CLASS}>
                  ���
                </button>
                <button
                  type="button"
                  onClick={saveEdit}
                  disabled={isSaving || !draft.trim()}
                  className="text-[12px] font-normal leading-[14px] text-[#505050] transition hover:opacity-70 disabled:opacity-40"
                >
                  {isSaving ? "���� ��..." : "����"}
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-text-primary)]">
                {comment.content}
              </p>
              <div className="flex items-center gap-3 pt-1 text-xs text-[var(--color-text-secondary)]">
                <button
                  type="button"
                  onClick={handleLikeClick}
                  className={`transition hover:text-[var(--color-text-primary)] ${comment.liked ? "text-[#ED4956]" : ""}`}
                >
                  {comment.liked ? "��" : "��"} {comment.likeCount}
                </button>
                {canReply ? (
                  <button
                    type="button"
                    onClick={handleReplyClick}
                    className="transition hover:text-[var(--color-text-primary)]"
                  >
                    ��� {comment.replyCount}
                  </button>
                ) : null}
              </div>
              {isReplying ? (
                <CommentReplyForm
                  variant="default"
                  content={replyContent}
                  isSubmitting={isReplySubmitting}
                  onContentChange={setReplyContent}
                  onSubmit={handleReplySubmit}
                />
              ) : null}
            </>
          )}
        </div>
      </div>
      {!isEditing ? replyList : null}
    </div>
  );
}
