"use client";
/** iTunes 앨범 선택 모달 상태 훅 */

import { useCallback, useState } from "react";
import { fetchJson, getApiErrorMessage } from "@/src/lib/http/client";
import type { ItunesArtistResult } from "@/src/lib/itunes/types";
import type {
  ArtistAlbumsResponse,
  ArtistSearchResponse,
  SearchAlbumResult,
} from "@/src/lib/search/types";

export function useItunesAlbumPicker() {
  const [searchQuery, setSearchQuery] = useState("");
  const [artists, setArtists] = useState<ItunesArtistResult[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<ItunesArtistResult | null>(null);
  const [albums, setAlbums] = useState<SearchAlbumResult[]>([]);
  const [isSearchingArtists, setIsSearchingArtists] = useState(false);
  const [isLoadingAlbums, setIsLoadingAlbums] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setSearchQuery("");
    setArtists([]);
    setSelectedArtist(null);
    setAlbums([]);
    setError(null);
    setIsSearchingArtists(false);
    setIsLoadingAlbums(false);
  }, []);

  const searchArtists = useCallback(
    async (event?: React.FormEvent) => {
      event?.preventDefault();
      const term = searchQuery.trim();
      if (!term) {
        setArtists([]);
        setSelectedArtist(null);
        setAlbums([]);
        return;
      }

      setIsSearchingArtists(true);
      setSelectedArtist(null);
      setAlbums([]);
      setError(null);

      try {
        const data = await fetchJson<ArtistSearchResponse>(
          `/api/itunes/artists?term=${encodeURIComponent(term)}`
        );
        setArtists(data.data.artists ?? []);
      } catch (err) {
        setError(getApiErrorMessage(err, "아티스트 검색 중 오류가 발생했습니다."));
        setArtists([]);
      } finally {
        setIsSearchingArtists(false);
      }
    },
    [searchQuery]
  );

  const selectArtist = useCallback(async (artist: ItunesArtistResult) => {
    setSelectedArtist(artist);
    setIsLoadingAlbums(true);
    setAlbums([]);
    setError(null);

    try {
      const data = await fetchJson<ArtistAlbumsResponse>(
        `/api/itunes/artists/${artist.artistId}/albums`
      );
      setAlbums(data.data.albums ?? []);
    } catch (err) {
      setError(getApiErrorMessage(err, "앨범 목록 로딩 중 오류가 발생했습니다."));
      setAlbums([]);
    } finally {
      setIsLoadingAlbums(false);
    }
  }, []);

  const backToArtists = useCallback(() => {
    setSelectedArtist(null);
    setAlbums([]);
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    artists,
    selectedArtist,
    albums,
    isSearchingArtists,
    isLoadingAlbums,
    error,
    setError,
    reset,
    searchArtists,
    selectArtist,
    backToArtists,
  };
}

export type ItunesAlbumPickerState = ReturnType<typeof useItunesAlbumPicker>;
