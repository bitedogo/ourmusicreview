"use client";
/** 좋아요·신고 인터랙션 버튼 */

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ReportModal } from "@/src/components/interaction/ReportModal";
import { ReviewDetailCircleButtons } from "@/src/components/interaction/ReviewDetailCircleButtons";
import { useReportModal } from "@/src/hooks/use-report-modal";

interface InteractionButtonsProps {
  postId?: string;
  reviewId?: string;
  isNotice?: boolean;
  authorUserId?: string;
  /** circle: 리뷰 상세 Figma 원형 버튼 */
  variant?: "default" | "circle";
}

export function InteractionButtons({
  postId,
  reviewId,
  isNotice,
  authorUserId,
  variant = "default",
}: InteractionButtonsProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [likeInfo, setLikeInfo] = useState({ count: 0, liked: false });

  const isOwnContent = authorUserId && session?.user?.id === authorUserId;

  const fetchLikeInfo = useCallback(async () => {
    try {
      const query = postId ? `postId=${postId}` : `reviewId=${reviewId}`;
      const response = await fetch(`/api/actions/like?${query}`);
      const data = await response.json();
      if (data.ok) {
        setLikeInfo({
          count: data.data?.count ?? 0,
          liked: data.data?.liked ?? false,
        });
      }
    } catch {
      /* ignore */
    }
  }, [postId, reviewId]);

  useEffect(() => {
    fetchLikeInfo();
  }, [fetchLikeInfo]);

  const handleLike = async () => {
    if (!session) {
      if (confirm("로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?")) {
        router.push("/auth/signin");
      }
      return;
    }

    try {
      const response = await fetch("/api/actions/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, reviewId }),
      });
      const data = await response.json();
      if (data.ok) {
        setLikeInfo((prev) => ({
          count: data.data?.liked ? prev.count + 1 : prev.count - 1,
          liked: data.data?.liked ?? prev.liked,
        }));
      }
    } catch {
      /* ignore */
    }
  };

  const handleReportSubmit = async (reason: string, detail: string) => {
    const reasonText = detail ? `${reason}\n\n[상세 내용]\n${detail}` : reason;

    try {
      const response = await fetch("/api/actions/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reasonText, postId, reviewId }),
      });
      const data = await response.json();
      if (data.ok) {
        alert(data.message || "신고가 접수되었습니다.");
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

  const handleOpenReportModal = () => {
    if (!session) {
      alert("로그인이 필요합니다.");
      return;
    }
    if (isOwnContent) return;
    reportModal.open();
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ url, title: document.title });
        return;
      }
      await navigator.clipboard.writeText(url);
      alert("링크가 복사되었습니다.");
    } catch {
      /* 사용자 취소 등 */
    }
  };

  const reportModalUi = reportModal.isOpen ? (
    <ReportModal
      title="신고하기"
      reportReason={reportModal.reason}
      reportDetail={reportModal.detail}
      isSubmitting={reportModal.isSubmitting}
      onReasonChange={reportModal.setReason}
      onDetailChange={reportModal.setDetail}
      onClose={reportModal.close}
      onSubmit={reportModal.submit}
    />
  ) : null;

  if (variant === "circle") {
    return (
      <>
        <ReviewDetailCircleButtons
          liked={likeInfo.liked}
          likeCount={likeInfo.count}
          showReport={Boolean(!isNotice && !isOwnContent)}
          onLike={handleLike}
          onShare={() => void handleShare()}
          onReport={handleOpenReportModal}
        />
        {reportModalUi}
      </>
    );
  }

  return (
    <div className="flex items-center gap-4 py-4">
      <button
        onClick={handleLike}
        className={`flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-bold transition ${
          likeInfo.liked
            ? "border-red-500 bg-red-50 text-red-500"
            : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
        }`}
      >
        <span>{likeInfo.liked ? "❤️" : "♡"}</span>
        <span>추천 {likeInfo.count}</span>
      </button>

      {!isNotice && !isOwnContent && (
        <button
          onClick={handleOpenReportModal}
          className="flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-xs font-bold text-zinc-400 transition hover:border-red-200 hover:text-red-400"
        >
          🚨 신고
        </button>
      )}

      {reportModalUi}
    </div>
  );
}
