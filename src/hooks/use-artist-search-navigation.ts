"use client";

import { useRouter } from "next/navigation";
import { buildArtistSearchPath, buildTextSearchPath } from "@/src/lib/itunes/search";
import type { ItunesArtistResult } from "@/src/lib/itunes/types";

export function useArtistSearchNavigation() {
  const router = useRouter();

  function navigateToTextSearch(query: string) {
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(buildTextSearchPath(trimmed));
  }

  function navigateToArtist(artist: ItunesArtistResult) {
    router.push(buildArtistSearchPath(artist));
  }

  return {
    navigateToTextSearch,
    navigateToArtist,
  };
}
