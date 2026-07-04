"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useArtistAutocomplete } from "@/src/hooks/use-artist-autocomplete";
import { useArtistSearchNavigation } from "@/src/hooks/use-artist-search-navigation";
import { PAGE_PADDING_X, contentMaxWidthStyle } from "@/src/lib/layout";
import type { ItunesArtistResult } from "@/src/lib/itunes/types";
import { ArtistSearchBar } from "./artist-search-bar";
import { DesktopNav } from "./header/desktop-nav";

export function HomeHeroSticky() {
  const [isScrolled, setIsScrolled] = useState(false);
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

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
      <div aria-hidden className="h-[var(--layout-logo-menu-gap)]" />
      <div className="sticky top-0 z-40">
        <div
          className={`relative left-1/2 w-screen -translate-x-1/2 transition-[background-color,backdrop-filter] duration-200 ${
            isScrolled ? "bg-white/50 backdrop-blur-md" : "bg-white"
          }`}
          style={{
            paddingTop: "var(--hero-sticky-padding-top)",
            paddingBottom: "var(--hero-sticky-padding-bottom)",
          }}
        >
          <div
            className={`mx-auto flex w-full flex-col ${PAGE_PADDING_X}`}
            style={contentMaxWidthStyle}
          >
            <DesktopNav
              isAdmin={isAdmin}
              className="hidden shrink-0 items-center justify-center gap-14 pb-0 text-[length:var(--nav-menu-font-size)] leading-[18px] font-medium text-black md:flex"
            />
            <div className="mt-0 shrink-0 md:mt-[var(--hero-sticky-nav-search-gap)]">
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
      </div>
    </>
  );
}
