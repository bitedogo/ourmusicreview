"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ArtistSearchBar } from "@/app/components/artist-search-bar";
import { DuplicateReviewModal } from "@/src/components/common/duplicate-review-modal";
import { useArtistAutocomplete } from "@/src/hooks/use-artist-autocomplete";
import { ApiClientError, fetchJson, getApiErrorMessage } from "@/src/lib/http/client";
import type { ItunesArtistResult } from "@/src/lib/itunes/types";
import { buildArtistSearchPath } from "@/src/lib/itunes/search";
import { ContentContainer } from "@/src/lib/layout/content-container";
import { HEADER_SEARCH_GAP, PAGE_PADDING_X } from "@/src/lib/layout/constants";
import type {
  ArtistAlbumsResponse,
  ArtistSearchResponse,
  BatchAlbumRatingsResponse,
  FavoritesResponse,
  ReviewDuplicateCheckResponse,
  SearchAlbumResult,
} from "@/src/lib/search/types";
import { buildReviewWritePath } from "@/src/lib/utils/album";
import { SearchAlbumCard } from "./search-album-card";

export function SearchClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const artistParamFromUrl = searchParams.get("artist");
  const artistIdFromUrl = searchParams.get("artistId");
  const initialQuery =
    artistIdFromUrl != null && artistIdFromUrl !== ""
      ? ""
      : artistParamFromUrl || searchParams.get("q") || "";

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
  const [isLoadingAlbums, setIsLoadingAlbums] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [albumRatings, setAlbumRatings] = useState<
    Record<string, { averageRating: number | null; reviewCount: number }>
  >({});
  const [favoriteAlbumIds, setFavoriteAlbumIds] = useState<Set<string>>(new Set());
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [checkingReviewAlbumId, setCheckingReviewAlbumId] = useState<string | null>(null);

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

  useEffect(() => {
    const artistId = artistIdFromUrl ? Number(artistIdFromUrl) : NaN;
    if (Number.isFinite(artistId) && artistParamFromUrl) {
      setSearchQuery("");
      handleArtistSelect({
        artistId,
        artistName: artistParamFromUrl,
      });
      return;
    }
    const q = searchParams.get("q")?.trim();
    if (q) {
      setSearchQuery(q);
      handleSearchAndRedirect(q);
    }
  }, [
    artistIdFromUrl,
    artistParamFromUrl,
    searchParams,
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

  async function toggleFavorite(album: SearchAlbumResult) {
    const albumId = album.collectionId.toString();
    const isFavorite = favoriteAlbumIds.has(albumId);

    try {
      if (!isFavorite) {
        await fetchJson<{ ok: boolean }>("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            albumId,
            albumTitle: album.collectionName,
            albumArtist: album.artistName,
            albumImageUrl: album.imageUrl600,
            albumReleaseDate: album.releaseDate,
          }),
        });

        setFavoriteAlbumIds((prev) => new Set(prev).add(albumId));
      } else {
        await fetchJson<{ ok: boolean }>("/api/favorites", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ albumId }),
        });

        setFavoriteAlbumIds((prev) => {
          const next = new Set(prev);
          next.delete(albumId);
          return next;
        });
      }
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 401) {
        router.push("/auth/signin?callbackUrl=/search");
      }
    }
  }

  useEffect(() => {
    async function fetchRatings() {
      if (albums.length === 0) {
        setAlbumRatings({});
        return;
      }

      const albumIds = Array.from(
        new Set(albums.map((album) => album.collectionId.toString()))
      );

      try {
        const ratingData = await fetchJson<BatchAlbumRatingsResponse>(
          `/api/albums/ratings?ids=${encodeURIComponent(albumIds.join(","))}`
        );
        setAlbumRatings(ratingData.data.ratings ?? {});
      } catch {
        setAlbumRatings({});
      }
    }

    fetchRatings();
  }, [albums]);

  useEffect(() => {
    async function fetchFavorites() {
      try {
        const data = await fetchJson<FavoritesResponse>("/api/favorites");
        const ids = new Set<string>();
        for (const favorite of data.data.favorites || []) {
          if (favorite.albumId) {
            ids.add(String(favorite.albumId));
          }
        }
        setFavoriteAlbumIds(ids);
      } catch (error) {
        if (error instanceof ApiClientError && error.status === 401) {
          return;
        }
      }
    }

    fetchFavorites();
  }, []);

  return (
    <ContentContainer
      className={`mx-auto flex min-h-screen w-full max-w-full flex-col gap-6 pb-10 ${PAGE_PADDING_X}`}
      style={{ paddingTop: HEADER_SEARCH_GAP }}
    >
      <section className="space-y-4">
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
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
            {errorMessage}
          </div>
        )}
      </section>

      {selectedArtist && (
        <section className="mt-8">
          <div className="mb-4">
            <h2 className="text-xl font-semibold tracking-tight text-zinc-900">
              {selectedArtist.artistName} 의 앨범
            </h2>
          </div>

          {isLoadingAlbums ? (
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-8 text-center text-sm text-zinc-500">
              앨범 목록을 불러오는 중...
            </div>
          ) : albums.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {albums.map((album) => {
                const albumId = album.collectionId.toString();
                return (
                  <SearchAlbumCard
                    key={album.collectionId}
                    album={album}
                    ratingInfo={albumRatings[albumId]}
                    isFavorite={favoriteAlbumIds.has(albumId)}
                    isCheckingReview={checkingReviewAlbumId === albumId}
                    onToggleFavorite={toggleFavorite}
                    onRegister={handleRegister}
                  />
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-6 text-center text-sm text-zinc-500">
              등록 가능한 앨범이 없습니다.
            </div>
          )}
        </section>
      )}

      {!selectedArtist && (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-6 text-center text-sm text-zinc-500">
          위 검색창에 아티스트 이름을 입력하고 검색해보세요.
        </div>
      )}

      {isDuplicateModalOpen && (
        <DuplicateReviewModal onClose={() => setIsDuplicateModalOpen(false)} />
      )}
    </ContentContainer>
  );
}
