"use client";

/** 앨범 리뷰 정렬 토글 */

import Link from "next/link";
import {
  EXPANDABLE_SORT_OPTION_CLASS,
  ExpandableSortToggle,
  expandableSortOptionTone,
} from "@/src/components/common/expandable-sort-toggle";

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

export function ReviewSortToggle({
  sort,
  expanded,
  onExpandedChange,
  buildHref,
}: ReviewSortToggleProps) {
  return (
    <ExpandableSortToggle expanded={expanded} onExpandedChange={onExpandedChange}>
      {SORT_OPTIONS.map((opt) => (
        <Link
          key={opt.value}
          href={buildHref(opt.value)}
          className={`${EXPANDABLE_SORT_OPTION_CLASS} ${expandableSortOptionTone(sort === opt.value)}`}
        >
          {opt.label}
        </Link>
      ))}
    </ExpandableSortToggle>
  );
}
