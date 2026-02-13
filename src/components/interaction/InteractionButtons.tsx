"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

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

interface InteractionButtonsProps {
  postId?: string;
  reviewId?: string;
  isNotice?: boolean;
  authorUserId?: string; // 글 작성자 ID (본인 글 신고 방지)
}

export function InteractionButtons({ postId, reviewId, isNotice, authorUserId }: InteractionButtonsProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [likeInfo, setLikeLikeInfo] = useState({ count: 0, liked: false });
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDetail, setReportDetail] = useState("");
  const [isReportSubmitting, setIsReportSubmitting] = useState(false);

  const isOwnContent = authorUserId && session?.user?.id === authorUserId;

  const fetchLikeInfo = async () => {
    try {
      const query = postId ? `postId=${postId}` : `reviewId=${reviewId}`;
      const response = await fetch(`/api/actions/like?${query}`);
      const data = await response.json();
      if (data.ok) {
        setLikeLikeInfo({ count: data.count, liked: data.liked });
      }
    } catch {
    }
  };

  useEffect(() => {
    fetchLikeInfo();
  }, [postId, reviewId]);

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
        setLikeLikeInfo((prev) => ({
          count: data.liked ? prev.count + 1 : prev.count - 1,
          liked: data.liked,
        }));
      }
    } catch {
    }
  };

  const handleOpenReportModal = () => {
    if (!session) {
      alert("로그인이 필요합니다.");
      return;
    }
    if (isOwnContent) return;
    setReportReason("");
    setReportDetail("");
    setIsReportModalOpen(true);
  };

  const handleCloseReportModal = () => {
    setIsReportModalOpen(false);
    setReportReason("");
    setReportDetail("");
  };

  const handleSubmitReport = async () => {
    if (!reportReason.trim()) {
      alert("신고 사유를 선택해주세요.");
      return;
    }
    const detail = reportDetail.trim();
    const reasonText = detail
      ? `${reportReason}\n\n[상세 내용]\n${detail}`
      : reportReason;

    setIsReportSubmitting(true);
    try {
      const response = await fetch("/api/actions/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reasonText, postId, reviewId }),
      });
      const data = await response.json();
      if (data.ok) {
        alert("신고가 접수되었습니다.");
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

      {/* 신고 모달 */}
      {isReportModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={handleCloseReportModal}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-4 text-lg font-semibold text-zinc-900">
              신고하기
            </h3>
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
      )}
    </div>
  );
}
