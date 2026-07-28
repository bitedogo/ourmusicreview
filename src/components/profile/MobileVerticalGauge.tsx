/** 프로필 평균 평점 게이지 - 모바일 세로 게이지 (Frame 23) */

import {
  MOBILE_BOX,
  MOBILE_FADE_PX,
  MOBILE_FILL_PATH,
  MOBILE_GAUGE_BOT,
  MOBILE_GAUGE_TOP,
  MOBILE_OUTLINE_PATH,
  MOBILE_TICKS,
  MOBILE_VB,
} from "./rating-gauge-geometry";
import type { GaugeIds } from "./rating-gauge-shared-types";

export function MobileVerticalGauge({
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
