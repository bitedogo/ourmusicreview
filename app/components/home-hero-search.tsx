"use client";

import { useSession } from "next-auth/react";
import { useArtistAutocomplete } from "@/src/hooks/use-artist-autocomplete";
import { useArtistSearchNavigation } from "@/src/hooks/use-artist-search-navigation";
import { PAGE_PADDING_X, contentMaxWidthStyle } from "@/src/lib/layout";
import type { ItunesArtistResult } from "@/src/lib/itunes/types";
import { ArtistSearchBar } from "./artist-search-bar";
import { DesktopNav } from "./header/desktop-nav";
import { HomeHeroCopy } from "./home-hero-copy";

export function HomeHeroSearch() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";
  const { navigateToTextSearch, navigateToArtist } = useArtistSearchNavigation();
  const {
    containerRef,
    searchQuery,
    setSearchQuery,
    suggestions,
    isLoading,
    isDropdownOpen,
    closeDropdown,
  } = useArtistAutocomplete();

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    closeDropdown();
    navigateToTextSearch(query);
  }

  function handleArtistSelect(artist: ItunesArtistResult) {
    closeDropdown();
    navigateToArtist(artist);
  }

  return (
    <>
      <div
        aria-hidden
        className="h-[var(--layout-header-search-gap)] sm:h-12"
      />
      <div className="sticky top-0 z-40">
        <div className="relative left-1/2 w-screen -translate-x-1/2 bg-white/50 backdrop-blur-md">
          <div
            className={`mx-auto w-full pb-4 pt-8 ${PAGE_PADDING_X}`}
            style={contentMaxWidthStyle}
          >
            <DesktopNav
              isAdmin={isAdmin}
              className="hidden items-center justify-center gap-14 pb-4 text-lg font-medium text-black md:flex"
            />
            <ArtistSearchBar
              containerRef={containerRef}
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
              onSubmit={handleSearchSubmit}
              suggestions={suggestions}
              isLoading={isLoading}
              isDropdownOpen={isDropdownOpen}
              onArtistSelect={handleArtistSelect}
            />
          </div>
        </div>
      </div>
      <div className="pb-[var(--hero-section-padding-bottom-mobile)] sm:pb-[var(--hero-section-padding-bottom-desktop)]">
        <HomeHeroCopy />
      </div>
    </>
  );
}
