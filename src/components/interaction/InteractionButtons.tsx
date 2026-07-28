"use client";
/** 좋아요·신고 인터랙션 버튼 */

import { useState, useEffect, useCallback } from "react";
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
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDetail, setReportDetail] = useState("");
  const [isReportSubmitting, setIsReportSubmitting] = useState(false);

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
        <h3 className="mb-4 text-lg font-semibold text-zinc-900">신고하기</h3>
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

  if (variant === "circle") {
    return (
      <div className="flex items-center justify-center gap-[14px] py-6">
        <button
          type="button"
          onClick={handleLike}
          aria-label={likeInfo.liked ? "좋아요 취소" : "좋아요"}
          className="relative h-[55px] w-[55px] shrink-0 transition hover:opacity-90"
        >
          <CircleLikeIcon />
          <span className="pointer-events-none absolute inset-x-0 bottom-[8px] text-center text-[11px] font-medium leading-none text-black">
            {likeInfo.count}
          </span>
        </button>

        <button
          type="button"
          onClick={() => alert("스크랩 기능은 준비 중입니다.")}
          aria-label="스크랩"
          className="h-[55px] w-[55px] shrink-0 transition hover:opacity-90"
        >
          <CircleScrapIcon />
        </button>

        {!isNotice && !isOwnContent && (
          <button
            type="button"
            onClick={handleOpenReportModal}
            aria-label="신고"
            className="h-[55px] w-[55px] shrink-0 transition hover:opacity-90"
          >
            <CircleSirenIcon />
          </button>
        )}

        {reportModal}
      </div>
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

      {reportModal}
    </div>
  );
}

/** 리뷰 상세 — 좋아요 (원 + 하트, 숫자는 버튼에서 별도 렌더) */
function CircleLikeIcon() {
  return (
    <svg
      width="55"
      height="55"
      viewBox="0 0 55 55"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className="block"
    >
      <path
        d="M54 27.5C54 12.8645 42.1355 1 27.5 1C12.8645 1 1 12.8645 1 27.5C1 42.1355 12.8645 54 27.5 54V55C12.3122 55 0 42.6878 0 27.5C0 12.3122 12.3122 0 27.5 0C42.6878 0 55 12.3122 55 27.5C55 42.6878 42.6878 55 27.5 55V54C42.1355 54 54 42.1355 54 27.5Z"
        fill="#D9D9D9"
      />
      <path
        d="M38 19.8057C38 25.524 28.6667 32 27.5 32C26.3333 32 17 25.524 17 19.8057C17 14.0874 24.7 10.947 27.5 18.5405C29.95 10.8319 38 14.0874 38 19.8057Z"
        fill="#F21414"
      />
    </svg>
  );
}

/** 리뷰 상세 — 스크랩 */
function CircleScrapIcon() {
  return (
    <svg
      width="55"
      height="55"
      viewBox="0 0 55 55"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className="block"
    >
      <circle cx="27.5" cy="27.5" r="27" stroke="#D9D9D9" />
      <path
        d="M32.8145 19.7754H35.8735C37.5629 19.7754 38.9325 21.1449 38.9325 22.8344V39.2079C38.9325 41.1037 37.3957 42.6406 35.4999 42.6406H20.7471C18.5038 42.6406 16.6853 40.822 16.6853 38.5788V22.9734C16.6853 21.2072 18.1171 19.7754 19.8833 19.7754H23.0814"
        stroke="#D9D9D9"
        strokeLinecap="round"
      />
      <path
        d="M25.4211 16.8428L21.0442 16.8428L27.8254 8.03418L34.6067 16.8428L30.3645 16.8428L30.3645 27.8965L25.4211 27.8965L25.4211 16.8428Z"
        fill="#43A7B2"
      />
      <path
        d="M25.4211 16.8428L25.9211 16.8428C25.9211 16.5666 25.6973 16.3428 25.4211 16.3428L25.4211 16.8428ZM21.0442 16.8428L20.648 16.5378C20.5318 16.6887 20.5114 16.8926 20.5956 17.0636C20.6797 17.2345 20.8537 17.3428 21.0442 17.3428L21.0442 16.8428ZM27.8254 8.03418L28.2216 7.72917C28.127 7.60622 27.9806 7.53418 27.8254 7.53418C27.6703 7.53418 27.5239 7.60622 27.4292 7.72917L27.8254 8.03418ZM34.6067 16.8428L34.6067 17.3428C34.7972 17.3428 34.9712 17.2345 35.0553 17.0636C35.1394 16.8926 35.1191 16.6887 35.0029 16.5378L34.6067 16.8428ZM30.3645 16.8428L30.3645 16.3428C30.0884 16.3428 29.8645 16.5666 29.8645 16.8428L30.3645 16.8428ZM30.3645 27.8965L30.3645 28.3965C30.6406 28.3965 30.8645 28.1726 30.8645 27.8965L30.3645 27.8965ZM25.4211 27.8965L24.9211 27.8965C24.9211 28.1726 25.145 28.3965 25.4211 28.3965L25.4211 27.8965ZM25.4211 16.8428L25.4211 16.3428L21.0442 16.3428L21.0442 16.8428L21.0442 17.3428L25.4211 17.3428L25.4211 16.8428ZM21.0442 16.8428L21.4404 17.1478L28.2216 8.33919L27.8254 8.03418L27.4292 7.72917L20.648 16.5378L21.0442 16.8428ZM27.8254 8.03418L27.4292 8.33919L34.2105 17.1478L34.6067 16.8428L35.0029 16.5378L28.2216 7.72917L27.8254 8.03418ZM34.6067 16.8428L34.6067 16.3428L30.3645 16.3428L30.3645 16.8428L30.3645 17.3428L34.6067 17.3428L34.6067 16.8428ZM30.3645 16.8428L29.8645 16.8428L29.8645 27.8965L30.3645 27.8965L30.8645 27.8965L30.8645 16.8428L30.3645 16.8428ZM30.3645 27.8965L30.3645 27.3965L25.4211 27.3965L25.4211 27.8965L25.4211 28.3965L30.3645 28.3965L30.3645 27.8965ZM25.4211 27.8965L25.9211 27.8965L25.9211 16.8428L25.4211 16.8428L24.9211 16.8428L24.9211 27.8965L25.4211 27.8965Z"
        fill="#43A7B2"
      />
    </svg>
  );
}

/** 리뷰 상세 — 신고 */
function CircleSirenIcon() {
  return (
    <svg
      width="55"
      height="55"
      viewBox="0 0 55 55"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className="block"
    >
      <circle cx="27.5" cy="27.5" r="27" stroke="#D9D9D9" />
      <path
        d="M27.8096 12.3594C34.0229 12.3594 39.0601 17.3966 39.0605 23.6104V37.9307H16.5576V23.6104C16.5579 17.3967 21.595 12.3596 27.8086 12.3594Z"
        fill="#F11414"
      />
      <rect
        x="13.4775"
        y="34.8511"
        width="28.6629"
        height="6.16002"
        rx="3.08001"
        fill="white"
        stroke="#D9D9D9"
      />
      <path
        d="M28.5196 19.7998L28.417 27.417H27.1865L27.084 19.7998H28.5196ZM27.8018 30.4932C27.2891 30.4932 26.8496 30.0684 26.8643 29.541C26.8496 29.0283 27.2891 28.6035 27.8018 28.6035C28.3145 28.6035 28.7393 29.0283 28.7393 29.541C28.7393 30.0684 28.3145 30.4932 27.8018 30.4932Z"
        fill="white"
      />
    </svg>
  );
}
