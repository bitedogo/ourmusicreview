"use client";
/** 댓글 목록·작성 섹션 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { CommentForm } from "@/src/components/interaction/CommentForm";
import { CommentList } from "@/src/components/interaction/CommentList";
import { COMMENT_DETAIL_CLASS as styles } from "@/src/components/interaction/comment-detail-styles";
import type { CommentItemData } from "@/src/components/interaction/comment-types";
import { useCommentCompose } from "@/src/hooks/use-comment-compose";
import {
  createCommentApi,
  deleteCommentApi,
  editCommentApi,
  fetchCommentsApi,
  toggleCommentLikeApi,
  updateCommentContentInTree,
  updateCommentLikeInTree,
} from "@/src/lib/comments/client-api";
import { getApiErrorMessage } from "@/src/lib/http/client";

const COMMENTS_PER_PAGE = 10;

interface CommentSectionProps {
  postId?: string;
  reviewId?: string;
  playlistId?: string;
  /** detail: 리뷰 상세 스타일 */
  variant?: "default" | "detail";
}

function CommentPagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="댓글 페이지" className={styles.pagination}>
      {Array.from({ length: totalPages }, (_, index) => index + 1).map(
        (pageNumber) => (
          <button
            key={pageNumber}
            type="button"
            onClick={() => onPageChange(pageNumber)}
            className={`transition hover:text-[#505050] ${
              pageNumber === page ? styles.paginationActive : ""
            }`}
          >
            {pageNumber}
          </button>
        )
      )}
    </nav>
  );
}

export function CommentSection({
  postId,
  reviewId,
  playlistId,
  variant = "default",
}: CommentSectionProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [comments, setComments] = useState<CommentItemData[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);

  const isLoggedIn = Boolean(session);
  const isAdmin =
    (session?.user as { role?: string } | undefined)?.role === "ADMIN";

  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchCommentsApi(postId, reviewId, playlistId);
      setComments(data.data.comments ?? []);
      setTotalCount(data.data.totalCount ?? data.data.comments?.length ?? 0);
    } catch {
      /* ignore */
    } finally {
      setIsLoading(false);
    }
  }, [postId, reviewId, playlistId]);

  useEffect(() => {
    void fetchComments();
  }, [fetchComments]);

  useEffect(() => {
    setPage(1);
  }, [comments.length]);

  const compose = useCommentCompose({
    postId,
    reviewId,
    playlistId,
    onCreated: fetchComments,
  });

  const requireLogin = () => {
    if (confirm("로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?")) {
      router.push("/auth/signin");
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm("댓글을 삭제하시겠습니까?")) return;

    try {
      await deleteCommentApi(commentId);
      await fetchComments();
    } catch (error) {
      alert(getApiErrorMessage(error, "댓글 삭제에 실패했습니다."));
    }
  };

  const handleEdit = async (commentId: string, nextContent: string) => {
    try {
      const data = await editCommentApi(commentId, nextContent);
      setComments((prev) =>
        updateCommentContentInTree(
          prev,
          commentId,
          data.data.content ?? nextContent
        )
      );
      return true;
    } catch (error) {
      alert(getApiErrorMessage(error, "댓글 수정 중 오류가 발생했습니다."));
      return false;
    }
  };

  const handleLike = async (commentId: string) => {
    if (!session) {
      requireLogin();
      return;
    }

    try {
      const data = await toggleCommentLikeApi(commentId);
      setComments((prev) =>
        updateCommentLikeInTree(
          prev,
          commentId,
          data.data.liked ?? false,
          data.data.count ?? 0
        )
      );
    } catch {
      /* ignore */
    }
  };

  const handleReply = async (parentId: string, content: string) => {
    if (!session) {
      requireLogin();
      return false;
    }

    try {
      await createCommentApi(content, postId, reviewId, parentId, playlistId);
      await fetchComments();
      return true;
    } catch (error) {
      alert(getApiErrorMessage(error, "답글 작성 중 오류가 발생했습니다."));
      return false;
    }
  };

  const totalPages = Math.max(1, Math.ceil(comments.length / COMMENTS_PER_PAGE));
  const pagedComments = useMemo(() => {
    if (variant !== "detail") return comments;
    const start = (page - 1) * COMMENTS_PER_PAGE;
    return comments.slice(start, start + COMMENTS_PER_PAGE);
  }, [comments, page, variant]);

  const listProps = {
    comments: variant === "detail" ? pagedComments : comments,
    isLoading,
    variant: variant as "default" | "detail",
    currentUserId: session?.user?.id,
    isAdmin,
    isLoggedIn,
    onDelete: handleDelete,
    onEdit: handleEdit,
    onLike: handleLike,
    onReply: handleReply,
  };

  const formProps = {
    variant: variant as "default" | "detail",
    content: compose.content,
    isSubmitting: compose.isSubmitting,
    isLoggedIn,
    onContentChange: compose.setContent,
    onSubmit: compose.submit,
  };

  const commentCountLabel = totalCount || comments.length;

  if (variant === "detail") {
    return (
      <section id="comments" className={styles.section}>
        <div className={styles.card}>
          <div className={styles.titleRow}>
            <h3 className={styles.title}>댓글</h3>
            <span className={styles.titleCount}>{commentCountLabel}</span>
          </div>

          <CommentForm {...formProps} />
          <CommentList {...listProps} />
          <CommentPagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </section>
    );
  }

  return (
    <section className="mt-10 space-y-6">
      <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
        <h3 className="text-sm font-bold text-[var(--color-text-primary)]">댓글</h3>
        <span className="text-xs text-[var(--color-text-muted)]">{commentCountLabel}</span>
      </div>

      <CommentList {...listProps} />
      <CommentForm {...formProps} />
    </section>
  );
}
