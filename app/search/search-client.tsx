"use client";
/** 검색 결과 클라이언트(앨범·아티스트) */

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AlbumDetailModal } from "@/src/components/album/album-detail-modal";
import { ArtistSearchBar } from "@/src/components/app/artist-search-bar";
import { DuplicateReviewModal } from "@/src/components/common/duplicate-review-modal";
import { EmptyState } from "@/src/components/common/empty-state";
import { useArtistAutocomplete } from "@/src/hooks/use-artist-autocomplete";
import { useBatchAlbumRatings } from "@/src/hooks/use-batch-album-ratings";
import { useBatchStreamingLinks } from "@/src/hooks/use-streaming-links";
import { useFavoriteAlbumIds } from "@/src/hooks/use-favorite-album-ids";
import type { AlbumDetail, AlbumDetailResponse } from "@/src/lib/album/detail-types";
import { ApiClientError, fetchJson, getApiErrorMessage } from "@/src/lib/http/client";
import type { ItunesArtistResult } from "@/src/lib/itunes/types";
import { buildArtistSearchPath } from "@/src/lib/itunes/search";
import { ContentContainer } from "@/src/lib/layout/content-container";
import { PAGE_PADDING_X } from "@/src/lib/layout";
import type {
  ArtistAlbumsResponse,
  ArtistSearchResponse,
  ReviewDuplicateCheckResponse,
  SearchAlbumResult,
  SearchReleaseType,
} from "@/src/lib/search/types";
import { buildReviewWritePath } from "@/src/lib/utils/album";
import { SearchAlbumCard } from "./search-album-card";

export function SearchClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const artistParamFromUrl = searchParams.get("artist");
  const artistIdFromUrl = searchParams.get("artistId");
  const qFromUrl = searchParams.get("q");
  const initialQuery =
    artistIdFromUrl != null && artistIdFromUrl !== ""
      ? ""
      : artistParamFromUrl || qFromUrl || "";

  const {
    containerRef: searchContainerRef,
    searchQuery,
    setSearchQuery,
    suggestions,
    isLoading: isLoadingSuggestions,
    isDropdownOpen,
    closeDropdown,
  } = useArtistAutocomplete({ initialQuery });

  const [selectedArtist, setSelectedArtist] = useState<ItunesArtistResult | null>(null);
  const [albums, setAlbums] = useState<SearchAlbumResult[]>([]);
  const [releaseFilter, setReleaseFilter] = useState<SearchReleaseType>("album");
  const [isLoadingAlbums, setIsLoadingAlbums] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [checkingReviewAlbumId, setCheckingReviewAlbumId] = useState<string | null>(null);
  const [detailAlbum, setDetailAlbum] = useState<AlbumDetail | null>(null);
  const [detailAlbumId, setDetailAlbumId] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const albumIdsKey = useMemo(
    () => albums.map((album) => album.collectionId.toString()).join(","),
    [albums]
  );
  const albumRatings = useBatchAlbumRatings(albumIdsKey);
  const streamingLinksByAlbumId = useBatchStreamingLinks(albumIdsKey);
  const { favoriteAlbumIds, toggleFavorite } = useFavoriteAlbumIds({
    onUnauthorized: () => router.push("/auth/signin?callbackUrl=/search"),
  });

  const handleSearchAndRedirect = useCallback(
    async (term: string) => {
      if (!term.trim()) return;

      setErrorMessage(null);
      try {
        const data = await fetchJson<ArtistSearchResponse>(
          `/api/itunes/artists?term=${encodeURIComponent(term)}`
        );
        const artistsList = data.data.artists || [];
        if (artistsList.length === 0) {
          setErrorMessage("검색 결과가 없습니다.");
          return;
        }
        const first = artistsList[0];
        router.replace(
          `/search?artistId=${first.artistId}&artist=${encodeURIComponent(first.artistName)}`
        );
      } catch (error) {
        setErrorMessage(getApiErrorMessage(error, "검색 중 오류가 발생했습니다."));
      }
    },
    [router]
  );

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    closeDropdown();
    handleSearchAndRedirect(q);
  }

  function handleArtistSelectFromDropdown(artist: ItunesArtistResult) {
    closeDropdown();
    router.push(buildArtistSearchPath(artist));
  }

  const handleArtistSelect = useCallback(async (artist: ItunesArtistResult) => {
    setSelectedArtist(artist);
    setReleaseFilter("album");
    setIsLoadingAlbums(true);
    setAlbums([]);
    setErrorMessage(null);

    try {
      const data = await fetchJson<ArtistAlbumsResponse>(
        `/api/itunes/artists/${artist.artistId}/albums`
      );
      setAlbums(data.data.albums || []);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "앨범 목록 조회 중 오류가 발생했습니다."));
      setAlbums([]);
    } finally {
      setIsLoadingAlbums(false);
    }
  }, []);

  const filteredAlbums = useMemo(
    () => albums.filter((album) => (album.releaseType ?? "album") === releaseFilter),
    [albums, releaseFilter]
  );

  const handleAlbumCoverClick = useCallback(async (album: SearchAlbumResult) => {
    const albumId = album.collectionId.toString();
    setIsDetailOpen(true);
    setIsDetailLoading(true);
    setDetailError(null);
    setDetailAlbum(null);
    setDetailAlbumId(albumId);

    try {
      const data = await fetchJson<AlbumDetailResponse>(
        `/api/itunes/album-detail?collectionId=${encodeURIComponent(album.collectionId)}`
      );
      setDetailAlbum(data.data.album);
    } catch (error) {
      setDetailError(
        getApiErrorMessage(error, "iTunes에서 앨범 정보를 불러오지 못했습니다.")
      );
    } finally {
      setIsDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    const artistId = artistIdFromUrl?.trim();
    if (artistId && artistParamFromUrl) {
      setSearchQuery("");
      handleArtistSelect({
        artistId,
        artistName: artistParamFromUrl,
      });
      return;
    }
    const q = qFromUrl?.trim();
    if (q) {
      setSearchQuery(q);
      handleSearchAndRedirect(q);
    }
  }, [
    artistIdFromUrl,
    artistParamFromUrl,
    qFromUrl,
    handleArtistSelect,
    handleSearchAndRedirect,
    setSearchQuery,
  ]);

  async function handleRegister(album: SearchAlbumResult) {
    const albumId = album.collectionId.toString();
    if (checkingReviewAlbumId) {
      return;
    }
    setCheckingReviewAlbumId(albumId);
    try {
      const check = await fetchJson<ReviewDuplicateCheckResponse>(
        `/api/reviews/check?albumId=${encodeURIComponent(albumId)}`
      );
      if (check.data.exists) {
        setIsDuplicateModalOpen(true);
        return;
      }
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 401) {
        router.push("/auth/signin?callbackUrl=/search");
        return;
      }
    } finally {
      setCheckingReviewAlbumId(null);
    }

    router.push(
      buildReviewWritePath({
        albumId,
        title: album.collectionName,
        artist: album.artistName,
        imageUrl: album.imageUrl600,
      })
    );
  }

  return (
    <ContentContainer
      className={`mx-auto flex min-h-screen w-full max-w-full flex-col gap-[var(--featured-card-gap)] pb-[var(--page-padding-x-mobile)] ${PAGE_PADDING_X}`}
      style={{ paddingTop: "var(--layout-header-search-gap)" }}
    >
      <section className="space-y-[var(--featured-card-padding)]">
        <ArtistSearchBar
          containerRef={searchContainerRef}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          onSubmit={handleSearchSubmit}
          suggestions={suggestions}
          isLoading={isLoadingSuggestions}
          isDropdownOpen={isDropdownOpen}
          onArtistSelect={handleArtistSelectFromDropdown}
        />

        {errorMessage && (
          <div className="rounded-[var(--featured-cover-radius)] border border-red-200 bg-red-50 px-[var(--featured-card-inner-gap)] py-[var(--featured-card-inner-gap)] text-[length:var(--text-today-album-body-mobile)] text-red-900">
            {errorMessage}
          </div>
        )}
      </section>

      {selectedArtist && (
        <section className="mt-[var(--featured-card-gap)]">
          <div className="mb-[var(--featured-card-padding)] flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-[length:var(--text-today-album-title)] font-semibold tracking-tight text-[var(--color-text-primary)]">
              {selectedArtist.artistName} 의{" "}
              {releaseFilter === "album" ? "앨범" : "싱글"}
            </h2>
            <div className="box-border flex h-[35px] w-[111px] items-center rounded-[10px] border border-[#D9D9D9] bg-[#FAFAFA] px-[5px]">
              <button
                type="button"
                onClick={() => setReleaseFilter("album")}
                className={`flex h-6 w-[47px] items-center justify-center rounded-[6px] text-[13px] leading-4 transition ${
                  releaseFilter === "album"
                    ? "bg-white text-[#43A7B2] shadow-[0px_1px_4px_rgba(0,0,0,0.25)]"
                    : "bg-transparent text-[#D9D9D9]"
                }`}
              >
                앨범
              </button>
              <button
                type="button"
                onClick={() => setReleaseFilter("single")}
                className={`flex h-6 flex-1 items-center justify-center rounded-[6px] text-[13px] leading-4 transition ${
                  releaseFilter === "single"
                    ? "bg-white text-[#43A7B2] shadow-[0px_1px_4px_rgba(0,0,0,0.25)]"
                    : "bg-transparent text-[#D9D9D9]"
                }`}
              >
                싱글
              </button>
            </div>
          </div>

          {isLoadingAlbums ? (
            <EmptyState className="py-[var(--featured-card-gap)]">
              앨범 목록을 불러오는 중...
            </EmptyState>
          ) : filteredAlbums.length > 0 ? (
            <div className="grid grid-cols-1 gap-[var(--featured-card-padding)] sm:grid-cols-2 lg:grid-cols-3">
              {filteredAlbums.map((album) => {
                const albumId = album.collectionId.toString();
                return (
                  <SearchAlbumCard
                    key={album.collectionId}
                    album={album}
                    ratingInfo={albumRatings[albumId]}
                    streamingLinks={streamingLinksByAlbumId[albumId]}
                    isFavorite={favoriteAlbumIds.has(albumId)}
                    isCheckingReview={checkingReviewAlbumId === albumId}
                    onToggleFavorite={toggleFavorite}
                    onRegister={handleRegister}
                    onCoverClick={handleAlbumCoverClick}
                  />
                );
              })}
            </div>
          ) : (
            <EmptyState>
              {releaseFilter === "album"
                ? "등록 가능한 앨범이 없습니다."
                : "등록 가능한 싱글이 없습니다."}
            </EmptyState>
          )}
        </section>
      )}

      {!selectedArtist && (
        <EmptyState>위 검색창에 아티스트 이름을 입력하고 검색해보세요.</EmptyState>
      )}

      {isDuplicateModalOpen && (
        <DuplicateReviewModal onClose={() => setIsDuplicateModalOpen(false)} />
      )}

      <AlbumDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setDetailError(null);
          setDetailAlbumId(null);
        }}
        album={detailAlbum}
        streamingLinks={detailAlbumId ? streamingLinksByAlbumId[detailAlbumId] : null}
        isLoading={isDetailLoading}
        error={detailError}
      />
    </ContentContainer>
  );
}
