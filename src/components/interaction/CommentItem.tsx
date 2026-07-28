"use client";
/** 댓글 한 줄 (default / detail) */

import Image from "next/image";
import Link from "next/link";
import { getUserProfilePath } from "@/src/components/profile/user-profile-view";
import { CommentReportIcon } from "@/src/components/interaction/interaction-icons";
import type { CommentItemData } from "@/src/components/interaction/comment-types";
import { formatDateYYYYMMDD } from "@/src/lib/utils/date";

interface CommentItemProps {
  comment: CommentItemData;
  variant: "default" | "detail";
  canModerate: boolean;
  onDelete: (commentId: string) => void;
  onReport: (commentId: string) => void;
}

export function CommentItem({
  comment,
  variant,
  canModerate,
  onDelete,
  onReport,
}: CommentItemProps) {
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
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link
                href={getUserProfilePath(comment.user.id)}
                className="block text-[16px] font-medium leading-[19px] text-black hover:underline"
              >
                {comment.user.nickname}
              </Link>
              <p className="mt-[2px] text-[12px] font-normal leading-[14px] text-[#D9D9D9]">
                {formatDateYYYYMMDD(comment.createdAt)}
              </p>
            </div>
            {canModerate ? (
              <button
                type="button"
                onClick={() => onDelete(comment.id)}
                className="shrink-0 text-[12px] text-zinc-400 hover:text-red-500"
              >
                삭제
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onReport(comment.id)}
                className="shrink-0 transition hover:opacity-80"
                aria-label="신고"
              >
                <span className="block h-[16px] w-[17px]">
                  <CommentReportIcon />
                </span>
              </button>
            )}
          </div>
          <p className="mt-[16px] whitespace-pre-wrap text-[14px] font-normal leading-[200%] text-black">
            {comment.content}
          </p>
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link
              href={getUserProfilePath(comment.user.id)}
              className="text-xs font-bold text-zinc-900 hover:underline"
            >
              {comment.user.nickname}
            </Link>
            <span className="text-[10px] text-zinc-400">
              {new Date(comment.createdAt).toLocaleDateString("ko-KR")}
            </span>
          </div>
          {canModerate ? (
            <button
              onClick={() => onDelete(comment.id)}
              className="text-[10px] text-zinc-400 hover:text-red-500"
            >
              삭제
            </button>
          ) : (
            <button
              onClick={() => onReport(comment.id)}
              className="shrink-0 transition hover:opacity-80"
              aria-label="신고"
            >
              <span className="block h-[14px] w-[15px]">
                <CommentReportIcon />
              </span>
            </button>
          )}
        </div>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
          {comment.content}
        </p>
      </div>
    </div>
  );
}
