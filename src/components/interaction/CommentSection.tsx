"use client";
/** 댓글 목록·작성 섹션 */

import { useState, useEffect, useCallback, useRef } from "react";
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
import {
  buildSigninHref,
  getCurrentReturnPath,
} from "@/src/lib/auth/callback-url";

const COMMENTS_PER_PAGE = 10;

interface CommentSectionProps {
  postId?: string;
  reviewId?: string;
  playlistId?: string;
  initialData?: CommentPageData;
}

export interface CommentPageData {
  comments: CommentItemData[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
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
  initialData,
}: CommentSectionProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [comments, setComments] = useState<CommentItemData[]>(
    initialData?.comments ?? []
  );
  const [totalCount, setTotalCount] = useState(initialData?.totalCount ?? 0);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(initialData?.page ?? 1);
  const [totalPages, setTotalPages] = useState(initialData?.totalPages ?? 1);
  const hasNavigatedFromInitialPage = useRef(false);

  const isLoggedIn = Boolean(session);
  const isAdmin =
    (session?.user as { role?: string } | undefined)?.role === "ADMIN";

  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchCommentsApi(postId, reviewId, playlistId, {
        page,
        pageSize: COMMENTS_PER_PAGE,
      });
      setComments(data.data.comments ?? []);
      setTotalCount(data.data.totalCount ?? data.data.comments?.length ?? 0);
      setTotalPages(Math.max(1, data.data.totalPages ?? 1));
      if (data.data.page && data.data.page !== page) {
        setPage(data.data.page);
      }
    } catch {
      /* ignore */
    } finally {
      setIsLoading(false);
    }
  }, [postId, reviewId, playlistId, page]);

  useEffect(() => {
    if (
      initialData &&
      page === initialData.page &&
      !hasNavigatedFromInitialPage.current
    ) {
      return;
    }
    if (initialData && page !== initialData.page) {
      hasNavigatedFromInitialPage.current = true;
    }
    void fetchComments();
  }, [fetchComments, initialData, page]);

  const compose = useCommentCompose({
    postId,
    reviewId,
    playlistId,
    onCreated: fetchComments,
  });

  const requireLogin = () => {
    if (confirm("로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?")) {
      router.push(buildSigninHref(getCurrentReturnPath()));
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

  const commentCountLabel = totalCount || comments.length;

  return (
    <section id="comments" className={styles.section}>
      <div className={styles.card}>
        <div className={styles.titleRow}>
          <h3 className={styles.title}>댓글</h3>
          <span className={styles.titleCount}>{commentCountLabel}</span>
        </div>

        <CommentForm
          content={compose.content}
          isSubmitting={compose.isSubmitting}
          isLoggedIn={isLoggedIn}
          onContentChange={compose.setContent}
          onSubmit={compose.submit}
        />
        <CommentList
          comments={comments}
          isLoading={isLoading}
          currentUserId={session?.user?.id}
          isAdmin={isAdmin}
          isLoggedIn={isLoggedIn}
          onDelete={handleDelete}
          onEdit={handleEdit}
          onLike={handleLike}
          onReply={handleReply}
        />
        <CommentPagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </section>
  );
}
