"use client";

import { useRouter } from "next/navigation";
import { buildArtistSearchPath, buildTextSearchPath } from "@/src/lib/itunes/search";
import type { ItunesArtistResult } from "@/src/lib/itunes/types";
import { useArtistAutocomplete } from "@/src/hooks/use-artist-autocomplete";
import { HomeArtistSearchBar } from "./home-artist-search-bar";
import { HomeHeroCopy } from "./home-hero-copy";

export function HomeHeroSearch() {
  const router = useRouter();
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
    router.push(buildTextSearchPath(query));
  }

  function handleArtistSelect(artist: ItunesArtistResult) {
    closeDropdown();
    router.push(buildArtistSearchPath(artist));
  }

  return (
    <section className="bg-white pt-2 pb-8 sm:pt-4 sm:pb-12">
      <HomeArtistSearchBar
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
