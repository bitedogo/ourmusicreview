"use client";

/** 앨범 리뷰 정렬 — 접힘/펼침 토글 (Figma Rectangle 88/89) */

import Link from "next/link";

export type ReviewSortType = "latest" | "likes" | "comments";

const SORT_OPTIONS: { value: ReviewSortType; label: string }[] = [
  { value: "latest", label: "최신" },
  { value: "likes", label: "좋아요" },
  { value: "comments", label: "댓글수" },
];

interface ReviewSortToggleProps {
  sort: ReviewSortType;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  buildHref: (sort: ReviewSortType) => string;
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

export function ReviewSortToggle({
  sort,
  expanded,
  onExpandedChange,
  buildHref,
}: ReviewSortToggleProps) {
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
        {SORT_OPTIONS.map((opt) => (
          <Link
            key={opt.value}
            href={buildHref(opt.value)}
            className={`flex h-6 w-[51px] shrink-0 items-center justify-center text-center text-[12px] font-semibold leading-[145%] tracking-[-0.005em] transition-colors ${
              sort === opt.value ? "text-[#43A7B2]" : "text-[#A9A9A9]"
            }`}
          >
            {opt.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
