"use client";

import type { ReactNode } from "react";

export const EXPANDABLE_SORT_OPTION_CLASS =
  "flex h-6 w-[51px] shrink-0 items-center justify-center text-center text-[12px] font-semibold leading-[145%] tracking-[-0.005em] transition-colors";

export function expandableSortOptionTone(selected: boolean) {
  return selected ? "text-[#43A7B2]" : "text-[var(--color-text-muted)]";
}

function EqualizerIcon() {
  return (
    <svg
      width="46"
      height="32"
      viewBox="4 3 46 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className="block"
    >
      <path
        d="M17 7V30"
        stroke="#43A7B2"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M27 7V30"
        stroke="#43A7B2"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M37 7V30"
        stroke="#43A7B2"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="17" cy="18" r="2.25" fill="white" stroke="#43A7B2" strokeWidth="1.5" />
      <circle cx="27" cy="22" r="2.25" fill="white" stroke="#43A7B2" strokeWidth="1.5" />
      <circle cx="37" cy="13" r="2.25" fill="white" stroke="#43A7B2" strokeWidth="1.5" />
    </svg>
  );
}

interface ExpandableSortToggleProps {
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  children: ReactNode;
}

export function ExpandableSortToggle({
  expanded,
  onExpandedChange,
  children,
}: ExpandableSortToggleProps) {
  return (
    <div
      className={`relative flex h-8 items-center rounded-[10px] transition-[width] duration-300 ease-out ${
        expanded
          ? "w-[233px] overflow-hidden bg-[#FAFAFA] shadow-[0px_1px_4px_rgba(0,0,0,0.25)]"
          : "w-[46px] overflow-visible bg-transparent"
      }`}
    >
      <button
        type="button"
        aria-label={expanded ? "정렬 옵션 접기" : "정렬 옵션 펴기"}
        aria-expanded={expanded}
        onClick={() => onExpandedChange(!expanded)}
        className="relative z-10 flex h-8 w-[46px] shrink-0 items-center justify-center rounded-[10px] bg-white shadow-[0px_1px_4px_rgba(0,0,0,0.25)]"
      >
        <EqualizerIcon />
      </button>

      <div
        className={`flex h-full flex-1 items-center justify-end gap-[9px] pr-[9px] transition-opacity duration-200 ${
          expanded ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
