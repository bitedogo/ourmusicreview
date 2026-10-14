"use client";
/** 좋아요·신고 인터랙션 버튼 */

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ReportModal } from "@/src/components/interaction/ReportModal";
import { ReviewDetailCircleButtons } from "@/src/components/interaction/ReviewDetailCircleButtons";
import { useReportModal } from "@/src/hooks/use-report-modal";
import {
  fetchContentLikeStatus,
  submitReportApi,
  toggleContentLikeApi,
} from "@/src/lib/engagement/client-api";
import { getApiErrorMessage } from "@/src/lib/http/client";
import {
  buildSigninHref,
  getCurrentReturnPath,
} from "@/src/lib/auth/callback-url";

interface InteractionButtonsProps {
  postId?: string;
  reviewId?: string;
  playlistId?: string;
  isNotice?: boolean;
  authorUserId?: string;
}

export function InteractionButtons({
  postId,
  reviewId,
  playlistId,
  isNotice,
  authorUserId,
}: InteractionButtonsProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [likeInfo, setLikeInfo] = useState({ count: 0, liked: false });

  const isOwnContent = authorUserId && session?.user?.id === authorUserId;
  const canReport = Boolean((postId || reviewId) && !isNotice && !isOwnContent);

  useEffect(() => {
    let cancelled = false;
    if (!postId && !reviewId && !playlistId) return;

    void fetchContentLikeStatus({ postId, reviewId, playlistId })
      .then((data) => {
        if (cancelled) return;
        setLikeInfo({
          count: data.data.count ?? 0,
          liked: data.data.liked ?? false,
        });
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [postId, reviewId, playlistId]);

  const handleLike = async () => {
    if (!session) {
      if (confirm("로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?")) {
        router.push(buildSigninHref(getCurrentReturnPath()));
      }
      return;
    }

    try {
      const data = await toggleContentLikeApi({ postId, reviewId, playlistId });
      setLikeInfo((prev) => ({
        count: data.data.liked ? prev.count + 1 : prev.count - 1,
        liked: data.data.liked ?? prev.liked,
      }));
    } catch {
      /* ignore */
    }
  };

  const handleReportSubmit = async (reason: string, detail: string) => {
    const reasonText = detail ? `${reason}\n\n[상세 내용]\n${detail}` : reason;

    try {
      const data = await submitReportApi({
        reason: reasonText,
        postId,
        reviewId,
      });
      alert(data.message || "신고가 접수되었습니다.");
      return true;
    } catch (error) {
      alert(getApiErrorMessage(error, "신고 처리 중 오류가 발생했습니다."));
      return false;
    }
  };

  const reportModal = useReportModal({ onSubmit: handleReportSubmit });

  const handleOpenReportModal = () => {
    if (!session) {
      alert("로그인이 필요합니다.");
      return;
    }
    if (!canReport) return;
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

  return (
    <>
      <ReviewDetailCircleButtons
        liked={likeInfo.liked}
        likeCount={likeInfo.count}
        showReport={canReport}
        onLike={handleLike}
        onShare={() => void handleShare()}
        onReport={handleOpenReportModal}
      />
      {reportModal.isOpen ? (
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
      ) : null}
    </>
  );
}
