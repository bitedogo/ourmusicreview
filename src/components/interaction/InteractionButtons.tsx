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
        d="M15.4495 22.0411C15.4495 18.6281 18.2162 15.8613 21.6292 15.8613H33.9888C37.4018 15.8613 40.1686 18.6281 40.1686 22.0411V36.4606C40.1686 39.8736 37.4018 42.6404 33.9888 42.6404H21.6292C18.2162 42.6404 15.4495 39.8736 15.4495 36.4606V22.0411Z"
        fill="#D9D9D9"
      />
      <path
        d="M33.9888 42.0222V42.6402H21.6292V42.0222H33.9888ZM39.5506 36.4604V22.0411C39.5506 18.9694 37.0605 16.4793 33.9888 16.4793H21.6292C18.5575 16.4793 16.0674 18.9694 16.0674 22.0411V36.4604C16.0674 39.5321 18.5575 42.0222 21.6292 42.0222V42.6402C18.2162 42.6402 15.4495 39.8734 15.4495 36.4604V22.0411C15.4495 18.7348 18.046 16.0347 21.3112 15.8692L21.6292 15.8613H33.9888L34.3068 15.8692C37.572 16.0347 40.1686 18.7348 40.1686 22.0411V36.4604C40.1686 39.8734 37.4018 42.6402 33.9888 42.6402V42.0222C37.0605 42.0222 39.5506 39.5321 39.5506 36.4604Z"
        fill="#D9D9D9"
      />
      <path
        d="M30.4507 18.6028H34.6377L27.8563 27.412L21.0748 18.6028H25.1267V11.7417H30.4507V18.6028Z"
        fill="white"
      />
      <path
        d="M29.8327 12.3597H25.7447V19.2208H22.3301L27.8563 26.3988L33.3825 19.2208H29.8327V12.3597ZM34.6377 18.6028L27.8563 27.412L21.0748 18.6028H25.1267V11.7417H30.4507V18.6028H34.6377Z"
        fill="#D9D9D9"
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
        d="M38.4426 23.6114C38.4426 17.8305 33.8294 13.1272 28.0836 12.9815L27.809 12.9778C21.9363 12.9778 17.1755 17.7387 17.1755 23.6114V37.3131H38.4426V23.6114ZM39.0606 37.9311H16.5575V23.6114C16.5575 17.3974 21.595 12.3599 27.809 12.3599C34.023 12.3599 39.0606 17.3974 39.0606 23.6114V37.9311Z"
        fill="#F11414"
      />
      <path
        d="M39.5506 40.8929V41.5109H16.0674V40.8929H39.5506ZM42.0225 38.421V37.441C42.0225 36.0758 40.9158 34.9691 39.5506 34.9691H16.0674C14.7022 34.9691 13.5955 36.0758 13.5955 37.441V38.421C13.5955 39.7862 14.7022 40.8929 16.0674 40.8929V41.5109C14.3609 41.5109 12.9775 40.1275 12.9775 38.421V37.441C12.9775 35.7877 14.276 34.4379 15.9087 34.3553L16.0674 34.3511H39.5506L39.7093 34.3553C41.342 34.4379 42.6405 35.7877 42.6405 37.441V38.421C42.6405 40.1275 41.2571 41.5109 39.5506 41.5109V40.8929C40.9158 40.8929 42.0225 39.7862 42.0225 38.421Z"
        fill="#D9D9D9"
      />
      <path
        d="M28.5701 19.731L28.4602 27.8902H27.1422L27.0324 19.731H28.5701ZM27.8012 31.1853C27.252 31.1853 26.7813 30.7302 26.797 30.1654C26.7813 29.6162 27.252 29.1611 27.8012 29.1611C28.3504 29.1611 28.8054 29.6162 28.8054 30.1654C28.8054 30.7302 28.3504 31.1853 27.8012 31.1853Z"
        fill="#F11414"
      />
    </svg>
  );
}
