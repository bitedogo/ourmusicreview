"use client";

import type { RefObject } from "react";
import type { ItunesArtistResult } from "@/src/lib/itunes/types";
import { HOME_CONTENT_MAX_WIDTH } from "@/src/lib/layout/constants";
import { ArtistSearchSuggestions } from "./artist-search-suggestions";

interface ArtistSearchBarProps {
  containerRef: RefObject<HTMLDivElement | null>;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  suggestions: ItunesArtistResult[];
  isLoading: boolean;
  isDropdownOpen: boolean;
  onArtistSelect: (artist: ItunesArtistResult) => void;
}

export function ArtistSearchBar({
  containerRef,
  searchQuery,
  onSearchQueryChange,
  onSubmit,
  suggestions,
  isLoading,
  isDropdownOpen,
  onArtistSelect,
}: ArtistSearchBarProps) {
  return (
    <form onSubmit={onSubmit} className="flex justify-center">
      <div
        ref={containerRef}
        className="relative w-full"
        style={{ maxWidth: HOME_CONTENT_MAX_WIDTH }}
      >
        <div
          className={`flex w-full flex-col overflow-hidden bg-white transition-[border-radius,box-shadow] ${
            isDropdownOpen
              ? "rounded-t-[32px] rounded-b-none border border-zinc-200 shadow-sm"
              : "rounded-full border border-zinc-200 shadow-sm"
          }`}
        >
          <div
            className={`flex h-14 w-full min-w-0 cursor-text items-center gap-2 px-2 sm:h-[65px] sm:gap-3 sm:px-3 ${
              isDropdownOpen ? "border-b border-zinc-200" : ""
            }`}
          >
            <input
              value={searchQuery}
              onChange={(event) => onSearchQueryChange(event.target.value)}
              className="h-full min-w-0 flex-1 cursor-text bg-transparent pl-2 text-sm text-black caret-black outline-none sm:pl-3"
            />
            <button
              type="submit"
              className="flex h-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] px-5 text-sm font-medium lowercase text-white transition hover:bg-[var(--color-accent-hover)] sm:h-[51px] sm:px-7 sm:text-base"
              aria-label="검색"
            >
              search
            </button>
          </div>

          {isDropdownOpen && (
            <ul role="listbox">
              <ArtistSearchSuggestions
                suggestions={suggestions}
                isLoading={isLoading}
                onSelect={onArtistSelect}
              />
            </ul>
          )}
        </div>
      </div>
    </form>
  );
}
