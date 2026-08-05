"use client";
/** 리뷰 상세 댓글 한 줄 (Figma detail variant) */

import { useState } from "react";
import Link from "next/link";
import { CommentDetailInteractionBar } from "@/src/components/interaction/comment-detail-interaction-bar";
import { COMMENT_DETAIL_CLASS as styles } from "@/src/components/interaction/comment-detail-styles";
import { CommentAvatar } from "@/src/components/interaction/comment-avatar";
import { CommentReplyForm } from "@/src/components/interaction/CommentReplyForm";
import type { CommentItemData } from "@/src/components/interaction/comment-types";
import { getUserProfilePath } from "@/src/components/profile/user-profile-view";
import { useCommentEdit } from "@/src/hooks/use-comment-edit";
import { ensureLoggedIn } from "@/src/lib/interaction/require-login";
import { formatDateYYYYMMDDHHmm } from "@/src/lib/utils/date";

interface CommentDetailItemProps {
  comment: CommentItemData;
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

function CommentDetailOwnerActions({
  isOwner,
  canDelete,
  actionClass,
  onEdit,
  onDelete,
}: {
  isOwner: boolean;
  canDelete: boolean;
  actionClass: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  if (!isOwner && !canDelete) return null;

  return (
    <span className={styles.ownerActions}>
      {isOwner ? (
        <button type="button" onClick={onEdit} className={actionClass}>
          수정
        </button>
      ) : null}
      {canDelete ? (
        <button type="button" onClick={onDelete} className={actionClass}>
          삭제
        </button>
      ) : null}
    </span>
  );
}

export function CommentDetailItem({
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
}: CommentDetailItemProps) {
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

  const replyList =
    comment.replies.length > 0 ? (
      <div className={styles.replyList}>
        {comment.replies.map((reply) => (
          <CommentDetailItem
            key={reply.id}
            comment={reply}
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
    <div className={isReply ? styles.replyIndent : undefined}>
      <article className={styles.article}>
        <CommentAvatar user={comment.user} size="detail" />
        <div className="min-w-0 flex-1">
          <div className={styles.nicknameRow}>
            <Link href={getUserProfilePath(comment.user.id)} className={styles.nickname}>
              {comment.user.nickname}
            </Link>
            <time dateTime={comment.createdAt} className={styles.mobileDate}>
              {formatDateYYYYMMDDHHmm(comment.createdAt)}
            </time>
          </div>

          {isEditing ? (
            <div className="mt-[3px] space-y-2">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={3}
                className={styles.editTextarea}
              />
              <div className="flex justify-end gap-[7px]">
                <button type="button" onClick={cancelEdit} className={styles.action}>
                  취소
                </button>
                <button
                  type="button"
                  onClick={saveEdit}
                  disabled={isSaving || !draft.trim()}
                  className={styles.saveButton}
                >
                  {isSaving ? "저장 중..." : "저장"}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className={styles.contentWrap}>
                <p className={styles.content}>{comment.content}</p>
                <time dateTime={comment.createdAt} className={styles.desktopDate}>
                  {formatDateYYYYMMDDHHmm(comment.createdAt)}
                </time>
              </div>

              <div className={styles.actionsRow}>
                <CommentDetailInteractionBar
                  isOwner={isOwner}
                  likeCount={comment.likeCount}
                  replyCount={comment.replyCount}
                  liked={comment.liked}
                  canReply={canReply}
                  onLikeClick={handleLikeClick}
                  onReplyClick={canReply ? handleReplyClick : undefined}
                />
                <CommentDetailOwnerActions
                  isOwner={isOwner}
                  canDelete={canDelete}
                  actionClass={styles.action}
                  onEdit={startEdit}
                  onDelete={() => onDelete(comment.id)}
                />
              </div>

              {isReplying ? (
                <CommentReplyForm
                  variant="detail"
                  content={replyContent}
                  isSubmitting={isReplySubmitting}
                  onContentChange={setReplyContent}
                  onSubmit={handleReplySubmit}
                />
              ) : null}
            </>
          )}
        </div>
      </article>
      {!isEditing ? replyList : null}
    </div>
  );
}
