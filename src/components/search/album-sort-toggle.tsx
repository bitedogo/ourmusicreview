"use client";

import { useState } from "react";
import {
  EXPANDABLE_SORT_OPTION_CLASS,
  ExpandableSortToggle,
  expandableSortOptionTone,
} from "@/src/components/common/expandable-sort-toggle";
import {
  ALBUM_LIST_SORT_OPTIONS,
  type AlbumListSort,
} from "@/src/lib/search/album-sort";

interface AlbumSortToggleProps {
  value: AlbumListSort;
  onChange: (sort: AlbumListSort) => void;
}

export function AlbumSortToggle({ value, onChange }: AlbumSortToggleProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <ExpandableSortToggle expanded={expanded} onExpandedChange={setExpanded}>
      {ALBUM_LIST_SORT_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`${EXPANDABLE_SORT_OPTION_CLASS} ${expandableSortOptionTone(value === option.value)}`}
        >
          {option.label}
        </button>
      ))}
    </ExpandableSortToggle>
  );
}
