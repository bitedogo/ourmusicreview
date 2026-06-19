"use client";

import { useId, useMemo } from "react";
import { ProfileReviewItem, RATING_COMMENTS } from "./profile-types";

interface ProfileRatingGaugeProps {
  reviews: ProfileReviewItem[];
  nickname: string;
  averageRating?: number;
}

export function ProfileRatingGauge({
  reviews,
  nickname,
  averageRating,
}: ProfileRatingGaugeProps) {
  const computedAverage =
    averageRating ??
    (reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0);

  const hasRatingData =
    reviews.length > 0 || (averageRating !== undefined && averageRating > 0);

  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const gradId = `pmg-${uid}`;
  const pathId = `pml-${uid}`;

  const { arcLength, dashOffset, dotX, dotY, displayRating, ratingComment, reviewerType } =
    useMemo(() => {
      const clamped = Math.min(10, Math.max(0, computedAverage));
      const pct = clamped / 10;
      const arc = Math.PI * 48;
      return {
        arcLength: arc,
        dashOffset: arc * (1 - pct),
        dotX: 64 + 48 * Math.cos(Math.PI * (1 - pct)),
        dotY: 56 - 48 * Math.sin(Math.PI * (1 - pct)),
        displayRating: clamped,
        ratingComment: RATING_COMMENTS[Math.round(clamped)] ?? RATING_COMMENTS[5],
        reviewerType: clamped < 3.5 ? "harsh" : clamped < 6.5 ? "critical" : "light",
      } as const;
    }, [computedAverage]);

  if (!hasRatingData) {
    return <p className="text-center text-sm text-zinc-400">리뷰를 작성하면 평균 평점이 표시됩니다.</p>;
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-40 w-48 sm:h-48 sm:w-60">
        <svg viewBox="0 0 128 88" className="h-full w-full" aria-hidden>
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#5c6ba3" />
              <stop offset="100%" stopColor="#1E264D" />
            </linearGradient>
            <path id={pathId} d="M 8 56 A 56 56 0 0 1 120 56" fill="none" />
          </defs>
          <path
            d="M 16 56 A 48 48 0 0 1 112 56"
            fill="none"
            stroke="rgb(228 228 231)"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M 16 56 A 48 48 0 0 1 112 56"
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={arcLength}
            strokeDashoffset={dashOffset}
            strokeLinejoin="round"
            style={{ transition: "stroke-dashoffset 0.6s ease-out" }}
          />
          <circle cx={dotX} cy={dotY} r="5" fill="white" stroke="#1E264D" strokeWidth="2" />
          <text
            fontSize="5"
            fontWeight={reviewerType === "harsh" ? 600 : 500}
            fill={reviewerType === "harsh" ? "#1E264D" : "#71717a"}
          >
            <textPath href={`#${pathId}`} startOffset="12%" textAnchor="middle">
              Harsh Reviewer
            </textPath>
          </text>
          <text
            fontSize="5"
            fontWeight={reviewerType === "critical" ? 600 : 500}
            fill={reviewerType === "critical" ? "#1E264D" : "#71717a"}
          >
            <textPath href={`#${pathId}`} startOffset="50%" textAnchor="middle">
              Critical Reviewer
            </textPath>
          </text>
          <text
            fontSize="5"
            fontWeight={reviewerType === "light" ? 600 : 500}
            fill={reviewerType === "light" ? "#1E264D" : "#71717a"}
          >
            <textPath href={`#${pathId}`} startOffset="88%" textAnchor="middle">
              Light Reviewer
            </textPath>
          </text>
        </svg>
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
          <span className="text-3xl font-bold text-[#1E264D] sm:text-4xl md:text-5xl">
            {displayRating.toFixed(1)}
          </span>
        </div>
      </div>
      <p className="text-center text-xs font-medium text-zinc-600">
        평론가 <span className="font-semibold text-zinc-900">{nickname}</span> 님의 평균평점
      </p>
      <p className="text-center text-base font-bold text-[#1E264D]">{ratingComment}</p>
    </div>
  );
}
