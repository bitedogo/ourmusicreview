"use client";

/** 프로필 평균 평점 게이지 */

import { useId, useMemo } from "react";
import { ProfileRatingEmptyState } from "./ProfileRatingEmptyState";
import { ProfileReviewItem } from "./profile-types";
import {
  DESKTOP_TICKS,
  FADE_PX,
  GAUGE_H,
  GAUGE_W,
  MOBILE_BOX,
  MOBILE_FADE_PX,
  MOBILE_FILL_PATH,
  MOBILE_GAUGE_BOT,
  MOBILE_GAUGE_TOP,
  MOBILE_OUTLINE_PATH,
  MOBILE_TICKS,
  MOBILE_VB,
  WEDGE_FILL,
  WEDGE_OUTLINE,
} from "./rating-gauge-geometry";
import { computeRating } from "./rating-utils";

export { getListenerLabel, useAverageRating } from "./rating-utils";

interface ProfileRatingGaugeProps {
  reviews: ProfileReviewItem[];
  averageRating?: number;
  /** 바만 렌더 — 부모에서 점수/라벨 배치 (데스크톱 레이아웃) */
  barOnly?: boolean;
  /** mobileVertical: Frame 23 세로 게이지 */
  variant?: "default" | "mobileVertical";
}

type GaugeIds = {
  grad: string;
  fadeGrad: string;
  fadeMask: string;
  inner: string;
  cap: string;
};

export function ProfileRatingGauge({
  reviews,
  averageRating,
  barOnly = false,
  variant = "default",
}: ProfileRatingGaugeProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const ids: GaugeIds = {
    grad: `prg_grad_${uid}`,
    fadeGrad: `prg_fade_grad_${uid}`,
    fadeMask: `prg_fade_${uid}`,
    inner: `prg_inner_${uid}`,
    cap: `prg_cap_${uid}`,
  };

  const data = useMemo(() => {
    const base = computeRating(reviews, averageRating);
    const fillWidth = (base.displayRating / 10) * GAUGE_W;
    const isMax = base.displayRating >= 10;
    const fadeStart = Math.max(0, fillWidth - FADE_PX);
    const fadeStartPct = fillWidth > 0 ? (fadeStart / fillWidth) * 100 : 0;
    return { ...base, fillWidth, fadeStartPct, isMax };
  }, [reviews, averageRating]);

  if (!data.hasRatingData) {
    return <ProfileRatingEmptyState />;
  }

  if (variant === "mobileVertical") {
    return (
      <MobileVerticalGauge
        displayRating={data.displayRating}
        isMax={data.isMax}
        ids={ids}
      />
    );
  }

  const bar = (
    <DesktopWedgeBar
      fillWidth={data.fillWidth}
      fadeStartPct={data.fadeStartPct}
      isMax={data.isMax}
      ids={ids}
    />
  );

  if (barOnly) return bar;

  return (
    <div className="relative w-full max-w-[567px]">
      <p className="text-[24px] font-extrabold leading-[29px] text-[#43A7B2]">
        Average Rating
      </p>
      <p
        className="font-extrabold text-[#FFA310]"
        style={{ fontSize: 75, lineHeight: "90px" }}
      >
        {data.displayRating.toFixed(1)}
      </p>
      <div className="mt-1">{bar}</div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[15px] font-extralight leading-[18px] text-[#8F8F8F]">
          Born Hater
        </span>
        <span className="text-[15px] font-extralight leading-[18px] text-[#8F8F8F]">
          Sound Lover
        </span>
      </div>
      <p className="mt-6 text-center text-[32px] font-extrabold leading-[38px] text-[#43A7B2]">
        {data.listenerLabel}
      </p>
    </div>
  );
}

function DesktopWedgeBar({
  fillWidth,
  fadeStartPct,
  isMax,
  ids,
}: {
  fillWidth: number;
  fadeStartPct: number;
  isMax: boolean;
  ids: GaugeIds;
}) {
  return (
    <div className="relative w-full max-w-[567px]">
      <svg
        viewBox={`0 0 ${GAUGE_W} ${GAUGE_H}`}
        width={GAUGE_W}
        height={GAUGE_H}
        fill="none"
        className="block h-auto w-full"
        aria-hidden
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient
            id={ids.grad}
            x1="1"
            y1="92"
            x2="566"
            y2="92.0001"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#63C4CB" />
            <stop offset="0.35" stopColor="#F8CA12" />
            <stop offset="0.75" stopColor="#FFA310" />
            <stop offset="1" stopColor="#F82512" />
          </linearGradient>
          {!isMax && (
            <>
              <linearGradient
                id={ids.fadeGrad}
                gradientUnits="userSpaceOnUse"
                x1="0"
                y1="0"
                x2={Math.max(1, fillWidth)}
                y2="0"
              >
                <stop offset="0%" stopColor="white" stopOpacity="1" />
                <stop
                  offset={`${fadeStartPct}%`}
                  stopColor="white"
                  stopOpacity="1"
                />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </linearGradient>
              <mask
                id={ids.fadeMask}
                maskUnits="userSpaceOnUse"
                x="0"
                y="0"
                width={GAUGE_W}
                height={GAUGE_H}
              >
                <rect
                  x="0"
                  y="0"
                  width={Math.max(0, fillWidth)}
                  height={GAUGE_H}
                  fill={`url(#${ids.fadeGrad})`}
                />
              </mask>
            </>
          )}
          <clipPath id={ids.cap}>
            <rect x="0" y="0" width={Math.max(0, fillWidth)} height={GAUGE_H} />
          </clipPath>
        </defs>

        <path d={WEDGE_OUTLINE} stroke="#D9D9D9" fill="none" />

        <g clipPath={`url(#${ids.cap})`}>
          {isMax ? (
            <path d={WEDGE_FILL} fill={`url(#${ids.grad})`} />
          ) : (
            <g mask={`url(#${ids.fadeMask})`}>
              <path d={WEDGE_FILL} fill={`url(#${ids.grad})`} />
            </g>
          )}
          <path d={WEDGE_FILL} fill="none" stroke="white" strokeWidth={2} />
          {DESKTOP_TICKS.map((d) => (
            <path
              key={d}
              d={d}
              stroke="white"
              strokeWidth={3}
              strokeLinecap="round"
            />
          ))}
        </g>
      </svg>
    </div>
  );
}

function MobileVerticalGauge({
  displayRating,
  isMax,
  ids,
}: {
  displayRating: number;
  isMax: boolean;
  ids: GaugeIds;
}) {
  const fillH =
    (displayRating / 10) * (MOBILE_GAUGE_BOT - MOBILE_GAUGE_TOP);
  const fillY = MOBILE_GAUGE_BOT - fillH;
  const soundLoverOnFill = fillY <= MOBILE_GAUGE_TOP + 16;
  const fadeLen = Math.min(MOBILE_FADE_PX, fillH);
  const fadeStartY = fillY + fadeLen;
  const fadeStartPct =
    fillH > 0 ? ((MOBILE_GAUGE_BOT - fadeStartY) / fillH) * 100 : 0;
  const gradId = `${ids.grad}_m`;
  const fadeGradId = `${ids.fadeGrad}_m`;
  const fadeMaskId = `${ids.fadeMask}_m`;
  const innerId = `${ids.inner}_m`;
  const capId = `${ids.cap}_m`;

  const fillPath = (
    <path
      d={MOBILE_FILL_PATH}
      fill={`url(#${gradId})`}
      stroke="white"
      strokeWidth={2}
      strokeLinejoin="round"
    />
  );

  return (
    <div className="flex h-[178px] w-full max-w-[300px] items-start justify-center gap-0">
      <div className="relative z-10 flex w-[64px] shrink-0 flex-col pt-0.5">
        <p
          className="whitespace-nowrap font-extrabold text-[#43A7B2]"
          style={{ fontSize: 13, lineHeight: "16px" }}
        >
          Average Rating
        </p>
        <p
          className="font-extrabold text-[#FFA310]"
          style={{ fontSize: 48, lineHeight: "57px" }}
        >
          {displayRating.toFixed(1)}
        </p>
      </div>

      <div
        className="relative shrink-0"
        style={{ width: MOBILE_BOX.w, height: MOBILE_BOX.h }}
      >
        <svg
          width={MOBILE_BOX.w}
          height={MOBILE_BOX.h}
          viewBox={`${MOBILE_VB.x} ${MOBILE_VB.y} ${MOBILE_VB.w} ${MOBILE_VB.h}`}
          className="block overflow-visible"
          fill="none"
          aria-hidden
        >
          <defs>
            <linearGradient
              id={gradId}
              x1="160"
              y1="398"
              x2="160"
              y2="576"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#F82512" />
              <stop offset="0.3125" stopColor="#FFA310" />
              <stop offset="0.644231" stopColor="#F8CA12" />
              <stop offset="1" stopColor="#63C4CB" />
            </linearGradient>
            {!isMax && (
              <>
                <linearGradient
                  id={fadeGradId}
                  gradientUnits="userSpaceOnUse"
                  x1="0"
                  y1={MOBILE_GAUGE_BOT}
                  x2="0"
                  y2={Math.min(fillY, MOBILE_GAUGE_BOT - 1)}
                >
                  <stop offset="0%" stopColor="white" stopOpacity="1" />
                  <stop
                    offset={`${fadeStartPct}%`}
                    stopColor="white"
                    stopOpacity="1"
                  />
                  <stop offset="100%" stopColor="white" stopOpacity="0" />
                </linearGradient>
                <mask
                  id={fadeMaskId}
                  maskUnits="userSpaceOnUse"
                  x={MOBILE_VB.x}
                  y={MOBILE_VB.y}
                  width={MOBILE_VB.w}
                  height={MOBILE_VB.h}
                >
                  <rect
                    x={MOBILE_VB.x}
                    y={fillY}
                    width={MOBILE_VB.w}
                    height={Math.max(0, MOBILE_GAUGE_BOT - fillY + 2)}
                    fill={`url(#${fadeGradId})`}
                  />
                </mask>
              </>
            )}
            <clipPath id={innerId}>
              <path d={MOBILE_FILL_PATH} />
            </clipPath>
            <clipPath id={capId}>
              <rect
                x={MOBILE_VB.x}
                y={fillY}
                width={MOBILE_VB.w}
                height={Math.max(0, MOBILE_GAUGE_BOT - fillY + 2)}
              />
            </clipPath>
          </defs>

          <path
            d={MOBILE_OUTLINE_PATH}
            fill="#FFFFFF"
            stroke="#D9D9D9"
            strokeWidth={1}
            strokeLinejoin="round"
          />

          <g clipPath={`url(#${innerId})`}>
            <g clipPath={`url(#${capId})`}>
              {isMax ? (
                fillPath
              ) : (
                <g mask={`url(#${fadeMaskId})`}>{fillPath}</g>
              )}
              {MOBILE_TICKS.map((d) => (
                <path
                  key={d}
                  d={d}
                  stroke="white"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              ))}
            </g>
          </g>
        </svg>

        <span
          className={`pointer-events-none absolute right-[8.5px] top-[6px] z-10 whitespace-nowrap text-center ${
            soundLoverOnFill ? "text-white" : "text-[#B0B0B0]"
          }`}
          style={{ fontSize: 8, lineHeight: "10px", fontWeight: 200 }}
        >
          Sound Lover
        </span>
        <span
          className="pointer-events-none absolute bottom-[8px] right-[8.5px] z-10 whitespace-nowrap text-center text-white"
          style={{ fontSize: 8, lineHeight: "10px", fontWeight: 200 }}
        >
          Born Hater
        </span>
      </div>
    </div>
  );
}
