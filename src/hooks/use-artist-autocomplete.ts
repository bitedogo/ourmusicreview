"use client";
/** 아티스트 자동완성 검색 훅 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { ItunesArtistResult } from "@/src/lib/itunes/types";
import {
  ARTIST_SEARCH_DEBOUNCE_MS,
  fetchArtistAutocomplete,
  isAbortError,
} from "@/src/lib/itunes/search";
import { useClickOutside } from "./use-click-outside";

interface UseArtistAutocompleteOptions {
  initialQuery?: string;
}

export function useArtistAutocomplete(options: UseArtistAutocompleteOptions = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  const [searchQuery, setSearchQuery] = useState(options.initialQuery ?? "");
  const [suggestions, setSuggestions] = useState<ItunesArtistResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchQueryRef = useRef(searchQuery);

  useEffect(() => {
    searchQueryRef.current = searchQuery;
  }, [searchQuery]);

  const closeDropdown = useCallback(() => {
    setIsDropdownOpen(false);
  }, []);

  const fetchSuggestions = useCallback(async (term: string) => {
    abortRef.current?.abort();

    if (!term.trim()) {
      requestIdRef.current += 1;
      setSuggestions([]);
      setIsLoading(false);
      setIsDropdownOpen(false);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    const requestId = ++requestIdRef.current;

    setIsLoading(true);
    setIsDropdownOpen(true);

    try {
      const results = await fetchArtistAutocomplete(term, controller.signal);
      if (
        requestId !== requestIdRef.current ||
        term.trim() !== searchQueryRef.current.trim()
      ) {
        return;
      }

      setSuggestions(results);
      setIsDropdownOpen(results.length > 0);
      setIsLoading(false);
    } catch (error) {
      if (isAbortError(error) || requestId !== requestIdRef.current) return;
      setSuggestions([]);
      setIsDropdownOpen(false);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const query = searchQuery.trim();

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(
      () => void fetchSuggestions(query),
      query ? ARTIST_SEARCH_DEBOUNCE_MS : 0
    );

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      abortRef.current?.abort();
      requestIdRef.current += 1;
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
