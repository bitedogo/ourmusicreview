"use client";
/** 리뷰 상세 댓글 한 줄 */

import Link from "next/link";
import { CommentDetailInteractionBar } from "@/src/components/interaction/comment-detail-interaction-bar";
import { COMMENT_DETAIL_CLASS as styles } from "@/src/components/interaction/comment-detail-styles";
import { CommentAvatar } from "@/src/components/interaction/comment-avatar";
import { CommentReplyForm } from "@/src/components/interaction/CommentReplyForm";
import { CommentTrackCard } from "@/src/components/interaction/comment-track-card";
import { CommentTrackField } from "@/src/components/interaction/comment-track-field";
import type { CommentItemData, CommentTrackData } from "@/src/components/interaction/comment-types";
import { getUserProfilePath } from "@/src/components/profile/user-profile-view";
import { useCommentItemController } from "@/src/hooks/use-comment-item-controller";
import type { AlbumStreamingLinks } from "@/src/lib/streaming/types";
import { formatDateYYYYMMDDHHmm } from "@/src/lib/utils/date";

interface CommentDetailItemProps {
  comment: CommentItemData;
  depth?: number;
  currentUserId?: string;
  isAdmin?: boolean;
  isLoggedIn: boolean;
  isReply?: boolean;
  playingCommentId: string | null;
  streamingLinksByTrackId: Record<string, AlbumStreamingLinks>;
  onTogglePlay: (commentId: string) => void;
  onStopPlay: (commentId: string) => void;
  onDelete: (commentId: string) => void;
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

function OwnerActions({
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}: {
  canEdit: boolean;
  canDelete: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  if (!canEdit && !canDelete) return null;

  return (
    <span className={styles.ownerActions}>
      {canEdit ? (
        <button type="button" onClick={onEdit} className={styles.action}>
          수정
        </button>
      ) : null}
      {canDelete ? (
        <button type="button" onClick={onDelete} className={styles.action}>
          삭제
        </button>
      ) : null}
    </span>
  );
}

function EditForm({
  draft,
  draftTrack,
  isSaving,
  onDraftChange,
  onDraftTrackChange,
  onCancel,
  onSave,
}: {
  draft: string;
  draftTrack: CommentTrackData | null;
  isSaving: boolean;
  onDraftChange: (value: string) => void;
  onDraftTrackChange: (track: CommentTrackData | null) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  const hasText = Boolean(draft.trim());
  const hasTrack = Boolean(draftTrack);
  const canSave = hasText !== hasTrack;

  return (
    <div className={styles.editWrap}>
      <textarea
        value={draft}
        onChange={(e) => onDraftChange(e.target.value)}
        rows={3}
        disabled={hasTrack && !hasText}
        placeholder={hasTrack ? "곡만 등록됩니다" : undefined}
        className={styles.editTextarea}
      />
      <CommentTrackField
        track={draftTrack}
        disabled={hasText && !hasTrack}
        onChange={onDraftTrackChange}
      />
      <div className={styles.editActions}>
        <button type="button" onClick={onCancel} className={styles.action}>
          취소
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving || !canSave}
          className={styles.saveButton}
        >
          {isSaving ? "저장 중..." : "저장"}
        </button>
      </div>
    </div>
  );
}

export function CommentDetailItem({
  comment,
  depth = 0,
  currentUserId,
  isAdmin,
  isLoggedIn,
  isReply = false,
  playingCommentId,
  streamingLinksByTrackId,
  onTogglePlay,
  onStopPlay,
  onDelete,
  onEdit,
  onLike,
  onReply,
}: CommentDetailItemProps) {
  const {
    isEditing,
    draft,
    draftTrack,
    isSaving,
    setDraft,
    setDraftTrack,
    startEdit,
    cancelEdit,
    saveEdit,
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
  } = useCommentItemController({
    commentId: comment.id,
    initialContent: comment.content,
    initialTrack: comment.track,
    authorId: comment.user.id,
    depth,
    currentUserId,
    isAdmin,
    isLoggedIn,
    onEdit,
    onLike,
    onReply,
  });

  return (
    <div className={isReply ? styles.replyIndent : undefined}>
      <article className={styles.article}>
        <div className={styles.avatar}>
          <CommentAvatar user={comment.user} />
        </div>

        <div className={styles.body}>
          <div className={styles.nicknameRow}>
            <Link
              href={getUserProfilePath(comment.user.id)}
              className={styles.nickname}
            >
              {comment.user.nickname}
            </Link>
            <time dateTime={comment.createdAt} className={styles.mobileDate}>
              {formatDateYYYYMMDDHHmm(comment.createdAt)}
            </time>
          </div>

          {isEditing ? (
            <EditForm
              draft={draft}
              draftTrack={draftTrack}
              isSaving={isSaving}
              onDraftChange={setDraft}
              onDraftTrackChange={setDraftTrack}
              onCancel={cancelEdit}
              onSave={saveEdit}
            />
          ) : (
            <>
              <div className={styles.contentWrap}>
                {comment.track ? (
                  <CommentTrackCard
                    key={`${comment.track.trackId}:${comment.track.previewUrl ?? ""}`}
                    track={comment.track}
                    isPlaying={playingCommentId === comment.id}
                    streamingLinks={streamingLinksByTrackId[comment.track.trackId]}
                    onTogglePlay={() => onTogglePlay(comment.id)}
                    onStop={() => onStopPlay(comment.id)}
                  />
                ) : (
                  <p className={styles.content}>{comment.content}</p>
                )}
                <time
                  dateTime={comment.createdAt}
                  className={styles.desktopDate}
                >
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
                <OwnerActions
                  canEdit={canEdit}
                  canDelete={canDelete}
                  onEdit={startEdit}
                  onDelete={() => onDelete(comment.id)}
                />
              </div>

              {isReplying ? (
                <CommentReplyForm
                  content={replyContent}
                  isSubmitting={isReplySubmitting}
                  track={replyTrack}
                  onContentChange={setReplyContent}
                  onTrackChange={setReplyTrack}
                  onSubmit={handleReplySubmit}
                />
              ) : null}
            </>
          )}
        </div>
      </article>

      {!isEditing && comment.replies.length > 0 ? (
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
              playingCommentId={playingCommentId}
              streamingLinksByTrackId={streamingLinksByTrackId}
              onTogglePlay={onTogglePlay}
              onStopPlay={onStopPlay}
              onDelete={onDelete}
              onEdit={onEdit}
              onLike={onLike}
              onReply={onReply}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
