"use client";
/** 상세 댓글 작성·답글 입력 */

import { CommentTrackField } from "@/src/components/interaction/comment-track-field";
import { COMMENT_DETAIL_FORM_CLASS as form } from "@/src/components/interaction/comment-detail-styles";
import type { CommentTrackData } from "@/src/components/interaction/comment-types";

interface CommentDetailComposeBoxProps {
  content: string;
  isSubmitting: boolean;
  placeholder: string;
  onContentChange: (value: string) => void;
  track?: CommentTrackData | null;
  onTrackChange?: (track: CommentTrackData | null) => void;
  /** 로그인 안내 등 — 입력 대신 메시지 표시 */
  message?: string;
}

export function CommentDetailComposeBox({
  content,
  isSubmitting,
  placeholder,
  onContentChange,
  track = null,
  onTrackChange,
  message,
}: CommentDetailComposeBoxProps) {
  if (message) {
    return (
      <div className={form.box}>
        <p className={`${form.input} text-[#D9D9D9]`}>{message}</p>
      </div>
    );
  }

  const hasText = Boolean(content.trim());
  const hasTrack = Boolean(track);
  const canSubmit = hasText !== hasTrack;

  return (
    <>
      <div className={form.box}>
        <textarea
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder={hasTrack ? "곡만 등록됩니다" : placeholder}
          rows={1}
          disabled={hasTrack}
          className={form.input}
        />
        <button
          type="submit"
          disabled={isSubmitting || !canSubmit}
          className={form.submit}
        >
          {isSubmitting ? "..." : "등록"}
        </button>
      </div>
      {onTrackChange ? (
        <CommentTrackField
          track={track}
          disabled={hasText}
          onChange={onTrackChange}
        />
      ) : null}
    </>
  );
}
