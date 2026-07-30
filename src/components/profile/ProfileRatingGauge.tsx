"use client";

/** 프로필 평균 평점 게이지 (바만) */

import { useId, useMemo } from "react";
import { ProfileRatingEmptyState } from "./ProfileRatingEmptyState";
import { ProfileReviewItem } from "./profile-types";
import { DesktopWedgeBar } from "./DesktopWedgeBar";
import { FADE_PX, GAUGE_W } from "./rating-gauge-geometry";
import type { GaugeIds } from "./rating-gauge-shared-types";
import { computeRating } from "./rating-utils";

interface ProfileRatingGaugeProps {
  reviews: ProfileReviewItem[];
  averageRating?: number;
}

export function ProfileRatingGauge({
  reviews,
  averageRating,
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

  return (
    <DesktopWedgeBar
      fillWidth={data.fillWidth}
      fadeStartPct={data.fadeStartPct}
      isMax={data.isMax}
      ids={ids}
    />
  );
}
