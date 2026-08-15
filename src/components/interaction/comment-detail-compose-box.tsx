"use client";
/** 상세 댓글 작성·답글 입력 */

import { COMMENT_DETAIL_FORM_CLASS as form } from "@/src/components/interaction/comment-detail-styles";

interface CommentDetailComposeBoxProps {
  content: string;
  isSubmitting: boolean;
  placeholder: string;
  onContentChange: (value: string) => void;
  /** 로그인 안내 등 — 입력 대신 메시지 표시 */
  message?: string;
}

export function CommentDetailComposeBox({
  content,
  isSubmitting,
  placeholder,
  onContentChange,
  message,
}: CommentDetailComposeBoxProps) {
  if (message) {
    return (
      <div className={form.box}>
        <p className={`${form.input} text-[#D9D9D9]`}>{message}</p>
      </div>
    );
  }

  return (
    <div className={form.box}>
      <textarea
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
        placeholder={placeholder}
        rows={1}
        className={form.input}
      />
      <button
        type="submit"
        disabled={isSubmitting || !content.trim()}
        className={form.submit}
      >
        {isSubmitting ? "..." : "등록"}
      </button>
    </div>
  );
}
