"use client";
/** 댓글 목록·작성 섹션 */

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { CommentForm } from "@/src/components/interaction/CommentForm";
import { CommentList } from "@/src/components/interaction/CommentList";
import type { CommentItemData } from "@/src/components/interaction/comment-types";
import { ReportModal } from "@/src/components/interaction/ReportModal";
import { useReportModal } from "@/src/hooks/use-report-modal";

interface CommentSectionProps {
  postId?: string;
  reviewId?: string;
  /** detail: 리뷰 상세 Figma 스타일 */
  variant?: "default" | "detail";
}

export function CommentSection({
  postId,
  reviewId,
  variant = "default",
}: CommentSectionProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<CommentItemData[]>([]);
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportingCommentId, setReportingCommentId] = useState<string | null>(
    null
  );

  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    try {
      const query = postId ? `postId=${postId}` : `reviewId=${reviewId}`;
      const response = await fetch(`/api/comments?${query}`);
      const data = await response.json();
      if (data.ok) {
        setComments(data.data?.comments ?? []);
      }
    } catch {
      /* ignore */
    } finally {
      setIsLoading(false);
    }
  }, [postId, reviewId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, postId, reviewId }),
      });
      const data = await response.json();
      if (data.ok) {
        setContent("");
        fetchComments();
      } else {
        alert(data.error || "댓글 작성에 실패했습니다.");
      }
    } catch {
      /* ignore */
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("댓글을 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.ok) {
        fetchComments();
      } else {
        alert(data.error || "댓글 삭제에 실패했습니다.");
      }
    } catch {
      /* ignore */
    }
  };

  const handleReportSubmit = async (reason: string, detail: string) => {
    if (!reportingCommentId) {
      alert("신고 사유를 선택해주세요.");
      return false;
    }

    const target = comments.find((c) => c.id === reportingCommentId);
    const reasonText = [
      `[댓글 신고]`,
      `댓글 ID: ${reportingCommentId}`,
      `작성자: ${target?.user.nickname ?? "알 수 없음"}`,
      `내용: ${(target?.content ?? "").slice(0, 200)}`,
      "",
      `[사유]`,
      reason,
      detail ? `\n[상세 내용]\n${detail}` : "",
    ].join("\n");

    try {
      const response = await fetch("/api/actions/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reasonText, postId, reviewId }),
      });
      const data = await response.json();
      if (data.ok) {
        alert(data.message || "신고가 접수되었습니다.");
        setReportingCommentId(null);
        return true;
      }
      alert(data.error || "신고 처리에 실패했습니다.");
      return false;
    } catch {
      alert("신고 처리 중 오류가 발생했습니다.");
      return false;
    }
  };

  const reportModal = useReportModal({ onSubmit: handleReportSubmit });

  const handleOpenReportModal = (commentId: string) => {
    if (!session) {
      alert("로그인이 필요합니다.");
      return;
    }
    setReportingCommentId(commentId);
    reportModal.open();
  };

  const handleCloseReportModal = () => {
    reportModal.close();
    setReportingCommentId(null);
  };

  const reportModalUi = reportModal.isOpen ? (
    <ReportModal
      title="댓글 신고하기"
      reportReason={reportModal.reason}
      reportDetail={reportModal.detail}
      isSubmitting={reportModal.isSubmitting}
      onReasonChange={reportModal.setReason}
      onDetailChange={reportModal.setDetail}
      onClose={handleCloseReportModal}
      onSubmit={reportModal.submit}
    />
  ) : null;

  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "ADMIN";
  const listProps = {
    comments,
    isLoading,
    variant: variant as "default" | "detail",
    currentUserId: session?.user?.id,
    isAdmin,
    onDelete: handleDelete,
    onReport: handleOpenReportModal,
  };
  const formProps = {
    variant: variant as "default" | "detail",
    content,
    isSubmitting,
    isLoggedIn: Boolean(session),
    onContentChange: setContent,
    onSubmit: handleSubmit,
  };

  if (variant === "detail") {
    return (
      <section id="review-comments" className="mt-[40px] scroll-mt-8 sm:mt-[30px]">
        <div className="w-full rounded-[15px] border border-[#D9D9D9] bg-white shadow-[0px_2px_4px_rgba(0,0,0,0.25)]">
          <div className="px-4 pt-[30px] sm:px-[44px]">
            <div className="flex items-end gap-[11px]">
              <h3 className="text-[16px] font-normal leading-[19px] text-black">
                댓글
              </h3>
              <span className="text-[16px] font-normal leading-[19px] text-[#D9D9D9]">
                {comments.length}
              </span>
            </div>
            <div className="mt-[20px] h-px w-full bg-[#D9D9D9]" />
          </div>

          <CommentList {...listProps} />

          <div className="px-4 pb-[40px] pt-[48px] sm:px-[44px]">
            <CommentForm {...formProps} />
          </div>
        </div>
        {reportModalUi}
      </section>
    );
  }

  return (
    <section className="mt-10 space-y-6">
      <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
        <h3 className="text-sm font-bold text-zinc-900">댓글</h3>
        <span className="text-xs text-zinc-400">{comments.length}</span>
      </div>

      <CommentList {...listProps} />
      <CommentForm {...formProps} />
      {reportModalUi}
    </section>
  );
}
