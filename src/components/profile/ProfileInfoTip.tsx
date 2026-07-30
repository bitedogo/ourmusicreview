/** 프로필 섹션 안내 말풍선 (Figma SVG 꼬리 · hover/tap) */

"use client";

import { ReactNode, useId, useLayoutEffect, useRef, useState } from "react";
import {
  INFO_TIP_BUBBLE_WIDTH,
  INFO_TIP_BUBBLES,
} from "./profile-info-tip-config";
import { ProfileInfoIcon } from "./ProfileInfoIcon";
import { useProfileInfoTip } from "./useProfileInfoTip";

const VIEWPORT_MARGIN = 16;

interface ProfileInfoTipProps {
  label: string;
  tipId?: string;
  children: ReactNode;
  tall?: boolean;
}

export function ProfileInfoTip({
  label,
  tipId,
  children,
  tall = false,
}: ProfileInfoTipProps) {
  const autoId = useId();
  const resolvedTipId = tipId ?? autoId;
  const bubble = tall ? INFO_TIP_BUBBLES.tall : INFO_TIP_BUBBLES.normal;
  const { open, rootRef, onMouseEnter, onMouseLeave, onToggleClick } =
    useProfileInfoTip();
  const tipRef = useRef<HTMLSpanElement>(null);
  const [shiftX, setShiftX] = useState(0);

  useLayoutEffect(() => {
    if (!open || !tipRef.current) {
      setShiftX(0);
      return;
    }

    const clamp = () => {
      const tip = tipRef.current;
      if (!tip) return;
      tip.style.transform = "translateX(0px)";
      const rect = tip.getBoundingClientRect();
      let next = 0;
      if (rect.right > window.innerWidth - VIEWPORT_MARGIN) {
        next = window.innerWidth - VIEWPORT_MARGIN - rect.right;
      }
      if (rect.left + next < VIEWPORT_MARGIN) {
        next = VIEWPORT_MARGIN - rect.left;
      }
      setShiftX(next);
    };

    clamp();
    window.addEventListener("resize", clamp);
    return () => window.removeEventListener("resize", clamp);
  }, [open, tall]);

  return (
    <span
      ref={rootRef}
      className="relative inline-flex h-[22px] w-[22px] items-center justify-center"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <button
        type="button"
        aria-label={label}
        aria-describedby={resolvedTipId}
        aria-expanded={open}
        className="inline-flex h-[22px] w-[22px] items-center justify-center outline-none"
        onClick={onToggleClick}
      >
        <ProfileInfoIcon />
      </button>

      <span
        ref={tipRef}
        id={resolvedTipId}
        role="tooltip"
        className={`pointer-events-none absolute left-[-4px] top-[calc(100%+2px)] z-40 w-[min(334px,calc(100vw-2rem))] ${
          open ? "block" : "hidden"
        }`}
        style={{ transform: `translateX(${shiftX}px)` }}
      >
        <span
          className="relative block w-full"
          style={{ maxWidth: INFO_TIP_BUBBLE_WIDTH, minHeight: bubble.height }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bubble.src}
            alt=""
            width={INFO_TIP_BUBBLE_WIDTH}
            height={bubble.height}
            draggable={false}
            aria-hidden
            className="pointer-events-none absolute left-0 top-0 h-full w-full max-w-none select-none"
          />

          <span className="relative z-10 box-border block break-keep px-[18px] pb-[18px] pt-[46px] text-left text-[14px] font-normal leading-[20px] tracking-[-0.01em] text-black">
            {children}
          </span>
        </span>
      </span>
    </span>
  );
}
