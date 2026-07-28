/** 프로필 평균 평점 게이지 - 데스크톱 웨지 바 */

import {
  DESKTOP_TICKS,
  GAUGE_H,
  GAUGE_W,
  WEDGE_FILL,
  WEDGE_OUTLINE,
} from "./rating-gauge-geometry";
import type { GaugeIds } from "./rating-gauge-shared-types";

export function DesktopWedgeBar({
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
