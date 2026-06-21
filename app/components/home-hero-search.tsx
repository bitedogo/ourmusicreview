"use client";

import { useArtistAutocomplete } from "@/src/hooks/use-artist-autocomplete";
import { useArtistSearchNavigation } from "@/src/hooks/use-artist-search-navigation";
import type { ItunesArtistResult } from "@/src/lib/itunes/types";
import { ArtistSearchBar } from "./artist-search-bar";
import { HomeHeroCopy } from "./home-hero-copy";

export function HomeHeroSearch() {
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
    <section
      className="bg-white pb-[var(--hero-section-padding-bottom-mobile)] sm:pb-[var(--hero-section-padding-bottom-desktop)]"
      style={{ paddingTop: "var(--layout-header-search-gap)" }}
    >
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
      <HomeHeroCopy />
    </section>
  );
}
