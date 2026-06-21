"use client";

import type { RefObject } from "react";
import type { ItunesArtistResult } from "@/src/lib/itunes/types";
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
        style={{ maxWidth: "var(--search-bar-max-width)" }}
      >
        <div
          className={`flex w-full flex-col overflow-hidden bg-white transition-[border-radius,box-shadow] ${
            isDropdownOpen
              ? "rounded-t-[var(--search-bar-radius-open-top)] rounded-b-none border border-[var(--color-border)] shadow-sm"
              : "rounded-full border border-[var(--color-border)] shadow-sm"
          }`}
        >
          <div
            className={`flex h-[var(--search-bar-height-mobile)] w-full min-w-0 cursor-text items-center gap-[var(--search-bar-track-gap-mobile)] px-[var(--search-bar-track-padding-x-mobile)] sm:h-[var(--search-bar-height-desktop)] sm:gap-[var(--search-bar-track-gap-desktop)] sm:px-[var(--search-bar-track-padding-x-desktop)] ${
              isDropdownOpen ? "border-b border-[var(--color-border)]" : ""
            }`}
          >
            <input
              value={searchQuery}
              onChange={(event) => onSearchQueryChange(event.target.value)}
              className="h-full min-w-0 flex-1 cursor-text bg-transparent pl-[var(--search-bar-input-padding-left-mobile)] text-[length:var(--text-today-album-body-mobile)] text-black caret-black outline-none sm:pl-[var(--search-bar-input-padding-left-desktop)]"
            />
            <button
              type="submit"
              className="flex h-[var(--search-bar-button-height-mobile)] shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] px-[var(--search-bar-button-padding-x-mobile)] text-[length:var(--text-today-album-body-mobile)] font-medium lowercase text-white transition hover:bg-[var(--color-accent-hover)] sm:h-[var(--search-bar-button-height-desktop)] sm:px-[var(--search-bar-button-padding-x-desktop)] sm:text-[length:var(--text-today-album-body-desktop)]"
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
