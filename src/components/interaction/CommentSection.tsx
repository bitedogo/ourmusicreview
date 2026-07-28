"use client";
/** 댓글 목록·작성 섹션 */

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { getUserProfilePath } from "@/src/components/profile/user-profile-view";
import { formatDateYYYYMMDD } from "@/src/lib/utils/date";

const REPORT_REASONS = [
  "비방 및 인신공격",
  "게시판 성격 부적합",
  "도배 및 스팸",
  "허위 사실 및 루머",
  "장터 규정 위반",
  "저작권 침해",
  "개인정보 노출",
  "기타",
] as const;

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    nickname: string;
    profileImage: string | null;
  };
}

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
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDetail, setReportDetail] = useState("");
  const [reportingCommentId, setReportingCommentId] = useState<string | null>(null);
  const [isReportSubmitting, setIsReportSubmitting] = useState(false);

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

  const handleOpenReportModal = (commentId: string) => {
    if (!session) {
      alert("로그인이 필요합니다.");
      return;
    }
    setReportingCommentId(commentId);
    setReportReason("");
    setReportDetail("");
    setIsReportModalOpen(true);
  };

  const handleCloseReportModal = () => {
    setIsReportModalOpen(false);
    setReportReason("");
    setReportDetail("");
    setReportingCommentId(null);
  };

  const handleSubmitReport = async () => {
    if (!reportReason.trim() || !reportingCommentId) {
      alert("신고 사유를 선택해주세요.");
      return;
    }

    const target = comments.find((c) => c.id === reportingCommentId);
    const detail = reportDetail.trim();
    const reasonText = [
      `[댓글 신고]`,
      `댓글 ID: ${reportingCommentId}`,
      `작성자: ${target?.user.nickname ?? "알 수 없음"}`,
      `내용: ${(target?.content ?? "").slice(0, 200)}`,
      "",
      `[사유]`,
      reportReason,
      detail ? `\n[상세 내용]\n${detail}` : "",
    ].join("\n");

    setIsReportSubmitting(true);
    try {
      const response = await fetch("/api/actions/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reasonText, postId, reviewId }),
      });
      const data = await response.json();
      if (data.ok) {
        alert(data.message || "신고가 접수되었습니다.");
        handleCloseReportModal();
      } else {
        alert(data.error || "신고 처리에 실패했습니다.");
      }
    } catch {
      alert("신고 처리 중 오류가 발생했습니다.");
    } finally {
      setIsReportSubmitting(false);
    }
  };

  const reportModal = isReportModalOpen ? (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleCloseReportModal}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-4 text-lg font-semibold text-zinc-900">댓글 신고하기</h3>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">
              신고 사유
            </label>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
            >
              <option value="">사유를 선택하세요</option>
              {REPORT_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-zinc-700">
              상세 내용 (선택)
            </label>
            <textarea
              value={reportDetail}
              onChange={(e) => setReportDetail(e.target.value)}
              rows={4}
              placeholder="추가로 설명할 내용이 있으면 입력해주세요."
              className="w-full resize-none rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={handleCloseReportModal}
            className="rounded-full border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSubmitReport}
            disabled={isReportSubmitting}
            className="rounded-full bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isReportSubmitting ? "처리 중..." : "신고하기"}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  if (variant === "detail") {
    /* SVG 808×699: 카드(4,2) 800×691 / COMMENT / 구분선 y=66 / 댓글 / 입력(48.5,531.5) 711×120 */
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

          <div className="space-y-8 px-4 pt-[37px] sm:px-[44px]">
            {isLoading ? (
              <p className="py-6 text-center text-sm text-zinc-400">불러오는 중...</p>
            ) : comments.length === 0 ? (
              <p className="py-6 text-center text-sm text-zinc-400">
                첫 번째 댓글을 남겨보세요.
              </p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-[10px]">
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
                      {(session?.user?.id === comment.user.id ||
                        (session?.user as { role?: string })?.role === "ADMIN") ? (
                        <button
                          type="button"
                          onClick={() => handleDelete(comment.id)}
                          className="shrink-0 text-[12px] text-zinc-400 hover:text-red-500"
                        >
                          삭제
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenReportModal(comment.id)}
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
              ))
            )}
          </div>

          <div className="px-4 pb-[40px] pt-[48px] sm:px-[44px]">
            {session ? (
              <form onSubmit={handleSubmit} className="mx-auto w-full max-w-[711px]">
                <div className="relative">
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="멋있는 댓글을 달 수 있는 문화를 만들어 봅시다."
                    rows={4}
                    className="block h-[120px] w-full resize-none rounded-[10px] border border-[#D9D9D9] bg-white px-6 py-5 pb-12 text-[14px] leading-[200%] text-black outline-none placeholder:text-[#D9D9D9] focus:border-zinc-400"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting || !content.trim()}
                    className="absolute bottom-[8px] right-[8px] flex h-[30px] w-[86px] items-center justify-center rounded-[5px] bg-[#D9D9D9] text-[14px] font-normal text-white transition hover:bg-[#c8c8c8] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? "..." : "등록"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="py-6 text-center">
                <p className="text-sm text-zinc-500">
                  로그인 후 댓글을 남길 수 있습니다.
                </p>
              </div>
            )}
          </div>
        </div>
        {reportModal}
      </section>
    );
  }

  return (
    <section className="mt-10 space-y-6">
      <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
        <h3 className="text-sm font-bold text-zinc-900">댓글</h3>
        <span className="text-xs text-zinc-400">{comments.length}</span>
      </div>

      <div className="space-y-6">
        {isLoading ? (
          <p className="text-center text-xs text-zinc-400">불러오는 중...</p>
        ) : comments.length === 0 ? (
          <p className="py-10 text-center text-xs text-zinc-400">
            첫 번째 댓글을 남겨보세요.
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-4">
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
                  {(session?.user?.id === comment.user.id ||
                    (session?.user as { role?: string })?.role === "ADMIN") ? (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="text-[10px] text-zinc-400 hover:text-red-500"
                    >
                      삭제
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenReportModal(comment.id)}
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
          ))
        )}
      </div>

      {session ? (
        <form onSubmit={handleSubmit} className="space-y-3 border-t border-zinc-50 pt-6">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="댓글을 남겨보세요..."
            className="min-h-[80px] w-full rounded-xl border border-zinc-200 bg-white p-4 text-sm outline-none focus:border-zinc-400"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="rounded-full bg-[var(--color-brand-primary)] px-5 py-2 text-xs font-bold text-white transition hover:bg-[var(--color-brand-primary-hover)] disabled:bg-zinc-200"
            >
              {isSubmitting ? "작성 중..." : "등록"}
            </button>
          </div>
        </form>
      ) : (
        <div className="rounded-xl border border-zinc-100 bg-zinc-50 p-6 text-center">
          <p className="text-xs text-zinc-500">로그인 후 댓글을 남길 수 있습니다.</p>
        </div>
      )}
      {reportModal}
    </section>
  );
}

function CommentReportIcon() {
  return (
    <svg
      width="17"
      height="16"
      viewBox="0 0 17 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className="block"
    >
      <path
        d="M8.08984 0C11.4793 2.46698e-05 14.227 2.74776 14.227 6.1372V13.9479H1.95264V6.1372C1.95264 2.74774 4.70038 0 8.08984 0Z"
        fill="#F11414"
      />
      <rect x="0" y="12.2" width="16.18" height="3.8" rx="1.9" fill="#D9D9D9" />
      <path
        d="M14.4944 15.5644V15.9015H1.68539V15.5644H14.4944ZM15.8427 14.2161V13.6815C15.8427 12.9368 15.239 12.3332 14.4944 12.3332H1.68539C0.94074 12.3332 0.337079 12.9368 0.337079 13.6815V14.2161C0.337079 14.9607 0.94074 15.5644 1.68539 15.5644V15.9015C0.754577 15.9015 0 15.1469 0 14.2161V13.6815C0 12.7797 0.708238 12.0435 1.59882 11.9984L1.68539 11.9961H14.4944L14.581 11.9984C15.4715 12.0435 16.1798 12.7797 16.1798 13.6815V14.2161C16.1798 15.1469 15.4252 15.9015 14.4944 15.9015V15.5644C15.239 15.5644 15.8427 14.9607 15.8427 14.2161Z"
        fill="#D9D9D9"
      />
      <path
        d="M8.50493 4.02051L8.44502 8.471H7.7261L7.66619 4.02051H8.50493ZM8.08556 10.2683C7.78601 10.2683 7.52925 10.0201 7.53781 9.712C7.52925 9.41245 7.78601 9.16425 8.08556 9.16425C8.38511 9.16425 8.63331 9.41245 8.63331 9.712C8.63331 10.0201 8.38511 10.2683 8.08556 10.2683Z"
        fill="white"
      />
    </svg>
  );
}
