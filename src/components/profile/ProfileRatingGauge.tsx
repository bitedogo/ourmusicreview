"use client";

/** 프로필 평균 평점 게이지 */

import { useId, useMemo } from "react";
import { ProfileRatingEmptyState } from "./ProfileRatingEmptyState";
import { ProfileReviewItem } from "./profile-types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ProfileRatingGaugeProps {
  reviews: ProfileReviewItem[];
  averageRating?: number;
  /** 바만 렌더 — 부모에서 점수/라벨 배치 (데스크톱 레이아웃) */
  barOnly?: boolean;
  /** mobileVertical: Frame 23 세로 게이지 */
  variant?: "default" | "mobileVertical";
}

// ---------------------------------------------------------------------------
// Desktop wedge geometry (design SVG)
// ---------------------------------------------------------------------------

const GAUGE_W = 565;
const GAUGE_H = 182;
const FADE_PX = 72;
const TICK_FRACTIONS = [0.2, 0.4, 0.6, 0.8];

const WEDGE_OUTER =
  "M554.23 1.20215C559.236 0.067119 564 3.8717 564 9.00391V172.734C564 177.153 560.418 180.734 556 180.734H9C4.58172 180.734 1 177.153 1 172.734V133.049C1.00013 129.312 3.5866 126.074 7.23047 125.247L554.23 1.20215Z";

const WEDGE_INNER =
  "M550.23 5.20215C555.236 4.06712 560 7.8717 560 13.00391V168.734C560 173.153 556.418 176.734 552 176.734H13C8.58172 176.734 5 173.153 5 168.734V137.049C5.00013 133.312 7.5866 130.074 11.23047 129.247L550.23 5.20215Z";

const INNER_LEFT_X = 13;
const INNER_RIGHT_X = 552;
const INNER_BOTTOM_Y = 176.734;
const SLOPE_LEFT_X = 11.23047;
const SLOPE_LEFT_Y = 129.247;
const SLOPE_RIGHT_X = 550.23;
const SLOPE_RIGHT_Y = 5.20215;

function innerTopY(x: number) {
  return (
    SLOPE_LEFT_Y +
    ((x - SLOPE_LEFT_X) / (SLOPE_RIGHT_X - SLOPE_LEFT_X)) *
      (SLOPE_RIGHT_Y - SLOPE_LEFT_Y)
  );
}

// ---------------------------------------------------------------------------
// Mobile vertical gauge (Figma Frame 23 SVG export paths)
// ---------------------------------------------------------------------------

/** 안쪽 채움 path */
const MOBILE_FILL_PATH =
  "M79.0742 562.326C75.2651 567.618 79.0471 575 85.5674 575L243 575C247.418 575 251 571.418 251 567L251 407C251 402.582 247.418 399 243 399L200.738 399C198.165 399 195.748 400.238 194.245 402.326L79.0742 562.326Z";

/** 바깥 테두리 path (채움보다 약간 큼 → 안쪽 여백) */
const MOBILE_OUTLINE_PATH =
  "M77.8574 561.45C73.334 567.734 77.8245 576.5 85.5674 576.5L243 576.5C248.247 576.5 252.5 572.247 252.5 567L252.5 407C252.5 401.753 248.247 397.5 243 397.5L200.738 397.5C197.682 397.5 194.813 398.97 193.027 401.45L131.658 486.708L77.8574 561.45Z";

const MOBILE_TICKS = [
  "M251 486.842L174 486.842",
  "M250 531.579L140 531.579",
  "M250 439.901L205 439.901",
] as const;

const MOBILE_GAUGE_TOP = 399;
const MOBILE_GAUGE_BOT = 575;
const MOBILE_BOX = { w: 184, h: 178 } as const;
/** stroke 잘림 방지용 viewBox 패딩 */
const MOBILE_VB = { x: 63, y: 396, w: 192, h: 184 } as const;
/** 세로 채움 끝(위쪽) 페이드 — 데스크톱 FADE_PX에 대응 */
const MOBILE_FADE_PX = 48;

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

export function getListenerLabel(rating: number): string {
  if (rating < 3.5) return "Critical listener";
  if (rating < 6.5) return "Balanced listener";
  return "Positive listener";
}

function computeRating(reviews: ProfileReviewItem[], averageRating?: number) {
  const computed =
    averageRating ??
    (reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0);
  const clamped = Math.min(10, Math.max(0, computed));
  return {
    displayRating: clamped,
    listenerLabel: getListenerLabel(clamped),
    hasRatingData:
      reviews.length > 0 || (averageRating !== undefined && averageRating > 0),
  };
}

export function useAverageRating(
  reviews: ProfileReviewItem[],
  averageRating?: number
) {
  return useMemo(() => {
    const base = computeRating(reviews, averageRating);
    return {
      ...base,
      fillWidth: (base.displayRating / 10) * GAUGE_W,
    };
  }, [reviews, averageRating]);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ProfileRatingGauge({
  reviews,
  averageRating,
  barOnly = false,
  variant = "default",
}: ProfileRatingGaugeProps) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const ids = {
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
    const ticks = TICK_FRACTIONS.map((t) => {
      const x = INNER_LEFT_X + t * (INNER_RIGHT_X - INNER_LEFT_X);
      return { x, y1: innerTopY(x) + 6, y2: INNER_BOTTOM_Y - 2 };
    });
    return { ...base, fillWidth, fadeStartPct, ticks, isMax };
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
      ticks={data.ticks}
      isMax={data.isMax}
      ids={ids}
    />
  );

  if (barOnly) return bar;

  return (
    <div className="relative w-full max-w-[565px]">
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

// ---------------------------------------------------------------------------
// Desktop horizontal wedge
// ---------------------------------------------------------------------------

function DesktopWedgeBar({
  fillWidth,
  fadeStartPct,
  ticks,
  isMax,
  ids,
}: {
  fillWidth: number;
  fadeStartPct: number;
  ticks: { x: number; y1: number; y2: number }[];
  isMax: boolean;
  ids: { grad: string; fadeGrad: string; fadeMask: string; inner: string; cap: string };
}) {
  return (
    <div className="relative w-full max-w-[565px]">
      <svg
        viewBox={`0 0 ${GAUGE_W} ${GAUGE_H}`}
        fill="none"
        className="block h-auto w-full"
        aria-hidden
      >
        <defs>
          <linearGradient
            id={ids.grad}
            x1="0"
            y1="89.7344"
            x2="565"
            y2="89.7345"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#63C4CB" />
            <stop offset="0.3" stopColor="#F8CA12" />
            <stop offset="0.6" stopColor="#FFA310" />
            <stop offset="0.767357" stopColor="#F82512" />
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
                <stop offset={`${fadeStartPct}%`} stopColor="white" stopOpacity="1" />
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
                  width={fillWidth}
                  height={GAUGE_H}
                  fill={`url(#${ids.fadeGrad})`}
                />
              </mask>
            </>
          )}
          <clipPath id={ids.inner}>
            <path d={WEDGE_INNER} />
          </clipPath>
          <clipPath id={ids.cap}>
            <rect x="0" y="0" width={fillWidth} height={GAUGE_H} />
          </clipPath>
        </defs>

        <path d={WEDGE_OUTER} fill="none" stroke="#D9D9D9" strokeWidth={1} />

        <g clipPath={`url(#${ids.inner})`}>
          <g clipPath={`url(#${ids.cap})`}>
            {isMax ? (
              <path d={WEDGE_INNER} fill={`url(#${ids.grad})`} />
            ) : (
              <g mask={`url(#${ids.fadeMask})`}>
                <path d={WEDGE_INNER} fill={`url(#${ids.grad})`} />
              </g>
            )}
            {ticks.map((tick) => (
              <line
                key={tick.x}
                x1={tick.x}
                y1={tick.y1}
                x2={tick.x}
                y2={tick.y2}
                stroke="white"
                strokeWidth={2}
                strokeLinecap="round"
              />
            ))}
          </g>
        </g>
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mobile vertical trapezoid (Group 205: 184×178)
// ---------------------------------------------------------------------------

function MobileVerticalGauge({
  displayRating,
  isMax,
  ids,
}: {
  displayRating: number;
  isMax: boolean;
  ids: {
    grad: string;
    fadeGrad: string;
    fadeMask: string;
    inner: string;
    cap: string;
  };
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
    <div
      className="relative shrink-0 overflow-visible"
      style={{ width: MOBILE_BOX.w, height: MOBILE_BOX.h }}
    >
      <svg
        width={MOBILE_BOX.w}
        height={MOBILE_BOX.h}
        viewBox={`${MOBILE_VB.x} ${MOBILE_VB.y} ${MOBILE_VB.w} ${MOBILE_VB.h}`}
        className="absolute inset-0 block overflow-visible"
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
              {/* 아래(불투명) → 채움 끝 위쪽(투명) */}
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

      {/* 점수 (게이지 왼쪽 오버레이) */}
      <p
        className="pointer-events-none absolute left-0 top-0 z-10 whitespace-nowrap font-extrabold text-[#43A7B2]"
        style={{ fontSize: 13, lineHeight: "16px" }}
      >
        Average Rating
      </p>
      <p
        className="pointer-events-none absolute left-0 top-[16px] z-10 w-[67px] font-extrabold text-[#FFA310]"
        style={{ fontSize: 48, lineHeight: "57px" }}
      >
        {displayRating.toFixed(1)}
      </p>

      {/* 라벨 — font-weight 200, 한 줄 */}
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
  );
}
