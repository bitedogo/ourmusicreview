"use client";
/** 댓글 목록·작성 섹션 */

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  deleteCommentApi,
  editCommentApi,
  fetchCommentsApi,
} from "@/src/components/interaction/comment-api";
import { CommentForm } from "@/src/components/interaction/CommentForm";
import { CommentList } from "@/src/components/interaction/CommentList";
import type { CommentItemData } from "@/src/components/interaction/comment-types";
import { useCommentCompose } from "@/src/hooks/use-comment-compose";

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
  const [isLoading, setIsLoading] = useState(false);

  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchCommentsApi(postId, reviewId);
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

  const compose = useCommentCompose({
    postId,
    reviewId,
    onCreated: fetchComments,
  });

  const handleDelete = async (commentId: string) => {
    if (!confirm("댓글을 삭제하시겠습니까?")) return;

    try {
      const data = await deleteCommentApi(commentId);
      if (data.ok) {
        fetchComments();
      } else {
        alert(data.error || "댓글 삭제에 실패했습니다.");
      }
    } catch {
      /* ignore */
    }
  };

  const handleEdit = async (commentId: string, nextContent: string) => {
    try {
      const data = await editCommentApi(commentId, nextContent);
      if (data.ok) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === commentId
              ? { ...c, content: data.data?.content ?? nextContent }
              : c
          )
        );
        return true;
      }
      alert(data.error || "댓글 수정에 실패했습니다.");
      return false;
    } catch {
      alert("댓글 수정 중 오류가 발생했습니다.");
      return false;
    }
  };

  const isAdmin =
    (session?.user as { role?: string } | undefined)?.role === "ADMIN";
  const listProps = {
    comments,
    isLoading,
    variant: variant as "default" | "detail",
    currentUserId: session?.user?.id,
    isAdmin,
    onDelete: handleDelete,
    onEdit: handleEdit,
  };
  const formProps = {
    variant: variant as "default" | "detail",
    content: compose.content,
    isSubmitting: compose.isSubmitting,
    isLoggedIn: Boolean(session),
    onContentChange: compose.setContent,
    onSubmit: compose.submit,
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
    </section>
  );
}
