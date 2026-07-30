"use client";
/** 홈·헤더 아티스트 검색바 */

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
        className="relative w-full sm:max-w-[var(--search-bar-max-width)]"
      >
        <div className="flex w-full flex-col overflow-hidden rounded-[28px] border border-[var(--color-border)] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.45)] transition-[border-radius,box-shadow]">
          <div
            className={`flex h-[var(--search-bar-height-mobile)] w-full min-w-0 cursor-text items-center gap-[var(--search-bar-track-gap-mobile)] sm:h-[var(--search-bar-height-desktop)] sm:gap-[var(--search-bar-track-gap-desktop)] ${
              isDropdownOpen ? "border-b border-[var(--color-border)]" : ""
            }`}
          >
            <input
              value={searchQuery}
              onChange={(event) => onSearchQueryChange(event.target.value)}
              placeholder="아티스트 이름으로 검색"
              className="min-w-0 flex-1 cursor-text bg-transparent pl-[calc(var(--search-bar-track-padding-x-mobile)+var(--search-bar-input-padding-left-mobile))] text-[length:var(--search-bar-input-font-size)] text-black caret-black outline-none placeholder:text-[var(--color-text-muted)] sm:pl-[calc(var(--search-bar-track-padding-x-desktop)+var(--search-bar-input-padding-left-desktop))]"
            />
            <button
              type="submit"
              className="mr-[var(--search-bar-track-inset)] flex h-[var(--search-bar-button-height-mobile)] w-[var(--search-bar-button-width-mobile)] shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-white transition hover:bg-[var(--color-accent-hover)] sm:h-[var(--search-bar-button-height)] sm:w-[var(--search-bar-button-width)]"
              aria-label="검색"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden
                className="sm:hidden"
              >
                <circle
                  cx="6.92593"
                  cy="6.92593"
                  r="5.92593"
                  stroke="white"
                  strokeWidth="2"
                />
                <path
                  d="M11.6479 11.6484L16.9998 17.0003"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="hidden items-center justify-center text-center text-[22px] font-semibold lowercase leading-[145%] tracking-[-0.005em] text-white sm:inline-flex">
                search
              </span>
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
