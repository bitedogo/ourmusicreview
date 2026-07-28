"use client";
/** 댓글 한 줄 (default / detail) */

import Image from "next/image";
import Link from "next/link";
import { getUserProfilePath } from "@/src/components/profile/user-profile-view";
import type { CommentItemData } from "@/src/components/interaction/comment-types";
import { useCommentEdit } from "@/src/hooks/use-comment-edit";
import { formatDateYYYYMMDD } from "@/src/lib/utils/date";

const ACTION_CLASS =
  "shrink-0 text-[12px] font-normal leading-[14px] text-[#D9D9D9] transition hover:text-zinc-500";

interface CommentItemProps {
  comment: CommentItemData;
  variant: "default" | "detail";
  isOwner: boolean;
  canDelete: boolean;
  onDelete: (commentId: string) => void;
  onEdit: (commentId: string, content: string) => Promise<boolean>;
}

export function CommentItem({
  comment,
  variant,
  isOwner,
  canDelete,
  onDelete,
  onEdit,
}: CommentItemProps) {
  const { isEditing, draft, isSaving, setDraft, startEdit, cancelEdit, saveEdit } =
    useCommentEdit({
      initialContent: comment.content,
      commentId: comment.id,
      onEdit,
    });

  const actions =
    isOwner || canDelete ? (
      <span className="inline-flex items-center gap-[6px]">
        {isOwner ? (
          <button type="button" onClick={startEdit} className={ACTION_CLASS}>
            수정
          </button>
        ) : null}
        {canDelete ? (
          <button
            type="button"
            onClick={() => onDelete(comment.id)}
            className={ACTION_CLASS}
          >
            삭제
          </button>
        ) : null}
      </span>
    ) : null;

  if (variant === "detail") {
    return (
      <div className="flex gap-[10px]">
        <Link
          href={getUserProfilePath(comment.user.id)}
          className="h-[34px] w-[34px] shrink-0 overflow-hidden rounded-full bg-[#D9D9D9]"
          aria-label={`${comment.user.nickname} 프로필 보기`}
        >
          {comment.user.profileImage ? (
            <Image
              src={comment.user.profileImage}
              alt=""
              width={34}
              height={34}
              sizes="34px"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[11px] font-semibold text-zinc-500">
              {comment.user.nickname.charAt(0).toUpperCase()}
            </div>
          )}
        </Link>
        <div className="min-w-0 flex-1">
          <Link
            href={getUserProfilePath(comment.user.id)}
            className="block text-[16px] font-medium leading-[19px] text-black hover:underline"
          >
            {comment.user.nickname}
          </Link>
          <div className="mt-[2px] flex items-center gap-[24px]">
            <span className="text-[12px] font-normal leading-[14px] text-[#D9D9D9]">
              {formatDateYYYYMMDD(comment.createdAt)}
            </span>
            {!isEditing ? actions : null}
          </div>

          {isEditing ? (
            <div className="mt-[16px] space-y-2">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={3}
                className="w-full resize-none rounded-[10px] border border-[#D9D9D9] bg-white px-3 py-2 text-[14px] leading-[200%] text-black outline-none focus:border-zinc-400"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className={ACTION_CLASS}
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={saveEdit}
                  disabled={isSaving || !draft.trim()}
                  className="text-[12px] font-normal leading-[14px] text-black transition hover:opacity-70 disabled:opacity-40"
                >
                  {isSaving ? "저장 중..." : "저장"}
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-[16px] whitespace-pre-wrap text-[14px] font-normal leading-[200%] text-black">
              {comment.content}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4">
      <Link
        href={getUserProfilePath(comment.user.id)}
        className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-zinc-100"
        aria-label={`${comment.user.nickname} 프로필 보기`}
      >
        {comment.user.profileImage ? (
          <Image
            src={comment.user.profileImage}
            alt=""
            width={32}
            height={32}
            sizes="32px"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-zinc-400">
            {comment.user.nickname.charAt(0).toUpperCase()}
          </div>
        )}
      </Link>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <Link
            href={getUserProfilePath(comment.user.id)}
            className="text-xs font-bold text-zinc-900 hover:underline"
          >
            {comment.user.nickname}
          </Link>
          <span className="text-[12px] font-normal leading-[14px] text-[#D9D9D9]">
            {new Date(comment.createdAt).toLocaleDateString("ko-KR")}
          </span>
          {!isEditing ? <span className="ml-[24px]">{actions}</span> : null}
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
              <button type="button" onClick={cancelEdit} className={ACTION_CLASS}>
                취소
              </button>
              <button
                type="button"
                onClick={saveEdit}
                disabled={isSaving || !draft.trim()}
                className="text-[12px] font-normal leading-[14px] text-black transition hover:opacity-70 disabled:opacity-40"
              >
                {isSaving ? "저장 중..." : "저장"}
              </button>
            </div>
          </div>
        ) : (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
            {comment.content}
          </p>
        )}
      </div>
    </div>
  );
}
