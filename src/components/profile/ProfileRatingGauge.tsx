"use client";

/** 프로필 평균 평점 게이지 */

import { useId, useMemo } from "react";
import { ProfileRatingEmptyState } from "./ProfileRatingEmptyState";
import { ProfileReviewItem } from "./profile-types";
import { DesktopWedgeBar } from "./DesktopWedgeBar";
import { MobileVerticalGauge } from "./MobileVerticalGauge";
import { FADE_PX, GAUGE_W } from "./rating-gauge-geometry";
import type { GaugeIds } from "./rating-gauge-shared-types";
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
