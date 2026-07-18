"use client";
/** 아티스트 자동완성 검색 훅 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { ItunesArtistResult } from "@/src/lib/itunes/types";
import { ARTIST_SEARCH_DEBOUNCE_MS, fetchArtistAutocomplete } from "@/src/lib/itunes/search";
import { useClickOutside } from "./use-click-outside";

interface UseArtistAutocompleteOptions {
  initialQuery?: string;
}

export function useArtistAutocomplete(options: UseArtistAutocompleteOptions = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [searchQuery, setSearchQuery] = useState(options.initialQuery ?? "");
  const [suggestions, setSuggestions] = useState<ItunesArtistResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const closeDropdown = useCallback(() => {
    setIsDropdownOpen(false);
  }, []);

  const fetchSuggestions = useCallback(async (term: string) => {
    if (!term.trim()) {
      setSuggestions([]);
      setIsDropdownOpen(false);
      return;
    }

    setIsLoading(true);
    setIsDropdownOpen(true);

    const results = await fetchArtistAutocomplete(term);
    setSuggestions(results);
    setIsDropdownOpen(results.length > 0);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const query = searchQuery.trim();

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(
      () => fetchSuggestions(query),
      query ? ARTIST_SEARCH_DEBOUNCE_MS : 0
    );

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [searchQuery, fetchSuggestions]);

  useClickOutside(containerRef, closeDropdown);

  return {
    containerRef,
    searchQuery,
    setSearchQuery,
    suggestions,
    isLoading,
    isDropdownOpen,
    closeDropdown,
  };
}
