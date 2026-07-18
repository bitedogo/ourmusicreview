"use client";
/** 아티스트 검색 결과 네비게이션 훅 */

import { useRouter } from "next/navigation";
import { useState } from "react";
import { fetchJson } from "@/src/lib/http/client";
import {
  buildArtistSearchPath,
  buildTextSearchPath,
} from "@/src/lib/itunes/search";
import type { ItunesArtistResult } from "@/src/lib/itunes/types";
import type { ArtistSearchResponse } from "@/src/lib/search/types";
import { normalizeForMatch } from "@/src/lib/text/match";

export function useArtistSearchNavigation() {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  function navigateToTextSearch(query: string) {
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(buildTextSearchPath(trimmed));
  }

  function navigateToArtist(artist: ItunesArtistResult) {
    router.push(buildArtistSearchPath(artist));
  }

  /** artistId가 있으면 바로 이동, 없으면 이름으로 resolve 후 검색 결과와 동일 경로로 이동 */
  async function navigateToArtistAlbums(
    artistName: string,
    artistId?: string | null
  ) {
    const trimmed = artistName.trim();
    if (!trimmed || isNavigating) return;

    if (artistId?.trim()) {
      router.push(
        buildArtistSearchPath({ artistId: artistId.trim(), artistName: trimmed })
      );
      return;
    }

    setIsNavigating(true);
    try {
      const data = await fetchJson<ArtistSearchResponse>(
        `/api/itunes/artists?term=${encodeURIComponent(trimmed)}`
      );
      const artists = data.data.artists ?? [];
      const targetName = normalizeForMatch(trimmed);
      const matched =
        artists.find((artist) => normalizeForMatch(artist.artistName) === targetName) ??
        artists[0];

      if (matched) {
        router.push(buildArtistSearchPath(matched));
        return;
      }

      router.push(buildTextSearchPath(trimmed));
    } catch {
      router.push(buildTextSearchPath(trimmed));
    } finally {
      setIsNavigating(false);
    }
  }

  return {
    isNavigating,
    navigateToTextSearch,
    navigateToArtist,
    navigateToArtistAlbums,
  };
}
