"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { ApiClientError, fetchJson, getApiErrorMessage } from "@/src/lib/http/client";

interface ArtistResult {
  artistId: number;
  artistName: string;
  primaryGenreName?: string;
  artworkUrl100?: string;
}

interface AlbumResult {
  collectionId: number;
  collectionName: string;
  artistName: string;
  artworkUrl100: string;
  releaseDate: string;
  primaryGenreName: string;
  imageUrl600: string | null;
}

interface SearchAutocompleteResponse {
  ok: boolean;
  data: {
    results: ArtistResult[];
  };
}

interface ArtistSearchResponse {
  ok: boolean;
  data: {
    artists: ArtistResult[];
  };
}

interface ArtistAlbumsResponse {
  ok: boolean;
  data: {
    albums: AlbumResult[];
  };
}

interface BatchAlbumRatingsResponse {
  ok: boolean;
  data: {
    ratings: Record<string, { averageRating: number | null; reviewCount: number }>;
  };
}

interface FavoritesResponse {
  ok: boolean;
  data: {
    favorites: Array<{ albumId?: string | number | null }>;
  };
}

interface ReviewDuplicateCheckResponse {
  ok: boolean;
  data: {
    exists: boolean;
    reviewId: string | null;
  };
}

const DEBOUNCE_MS = 300;

export function SearchClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const artistParamFromUrl = searchParams.get("artist");
  const artistIdFromUrl = searchParams.get("artistId");
  const initialQuery =
    artistIdFromUrl != null && artistIdFromUrl !== ""
      ? ""
      : artistParamFromUrl || searchParams.get("q") || "";
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<ArtistResult[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<ArtistResult | null>(null);
  const [albums, setAlbums] = useState<AlbumResult[]>([]);
  const [isLoadingAlbums, setIsLoadingAlbums] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [albumRatings, setAlbumRatings] = useState<
    Record<string, { averageRating: number | null; reviewCount: number }>
  >({});
  const [favoriteAlbumIds, setFavoriteAlbumIds] = useState<Set<string>>(new Set());
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);

  const fetchSuggestions = useCallback(async (term: string) => {
    if (!term.trim()) {
      setSuggestions([]);
      setIsDropdownOpen(false);
      return;
    }
    setIsLoadingSuggestions(true);
    setIsDropdownOpen(true);
    try {
      const data = await fetchJson<SearchAutocompleteResponse>(
        `/api/itunes/search-autocomplete?term=${encodeURIComponent(term.trim())}`
      );
      if (Array.isArray(data.data?.results)) {
        setSuggestions(data.data.results);
        setIsDropdownOpen(data.data.results.length > 0);
      } else {
        setSuggestions([]);
        setIsDropdownOpen(false);
      }
    } catch {
      setSuggestions([]);
      setIsDropdownOpen(false);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, []);

  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setSuggestions([]);
      setIsDropdownOpen(false);
      return;
    }
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      fetchSuggestions(q);
    }, DEBOUNCE_MS);
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [searchQuery, fetchSuggestions]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchAndRedirect = useCallback(async (term: string) => {
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
  }, [router]);

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    setIsDropdownOpen(false);
    handleSearchAndRedirect(q);
  }

  function handleArtistSelectFromDropdown(artist: ArtistResult) {
    setIsDropdownOpen(false);
    router.push(
      `/search?artistId=${artist.artistId}&artist=${encodeURIComponent(artist.artistName)}`
    );
  }

  const handleArtistSelect = useCallback(async (artist: ArtistResult) => {
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
  }, [artistIdFromUrl, artistParamFromUrl, searchParams, handleArtistSelect, handleSearchAndRedirect]);

  async function handleRegister(album: AlbumResult) {
    const albumId = album.collectionId.toString();
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
    }

    const params = new URLSearchParams({
      albumId,
      title: album.collectionName,
      artist: album.artistName,
    });
    
    if (album.imageUrl600) {
      params.append("imageUrl", album.imageUrl600);
    }
    
    router.push(`/review/write?${params.toString()}`);
  }

  async function toggleFavorite(album: AlbumResult) {
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

        setFavoriteAlbumIds((prev) => {
          const next = new Set(prev);
          next.add(albumId);
          return next;
        });
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
    <div className="mx-auto flex min-h-screen w-[956px] max-w-full flex-col gap-6 px-6 py-10 sm:px-10">
      <section className="space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex justify-center">
          <div ref={searchContainerRef} className="relative w-full max-w-[956px]">
            <div
              className={`flex flex-col overflow-hidden bg-white transition-[border-radius,box-shadow] ${
                isDropdownOpen
                  ? "rounded-t-2xl rounded-b-none"
                  : "rounded-2xl border-2 border-[var(--color-brand-primary)]"
              }`}
            >
              <div
                className={`flex h-[68px] cursor-text items-center gap-3 ${
                  isDropdownOpen
                    ? "border-b-2 border-[var(--color-brand-primary)] px-4"
                    : "overflow-hidden px-3"
                }`}
              >
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-full flex-1 cursor-text bg-transparent pl-2 text-sm text-black caret-black outline-none placeholder:text-zinc-400"
                  placeholder="아티스트 이름으로 검색해보세요"
                />
                <button
                  type="submit"
                  className="flex h-[54px] w-[65px] shrink-0 items-center justify-center rounded-xl bg-[var(--color-brand-primary)] text-white transition hover:bg-[var(--color-brand-primary-hover)]"
                  aria-label="검색"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                </button>
              </div>

              {isDropdownOpen && (
                <ul role="listbox">
                  {isLoadingSuggestions ? (
                    <li className="px-4 py-3 text-sm text-zinc-500">검색 중...</li>
                  ) : (
                    suggestions.map((artist) => (
                      <li
                        key={artist.artistId}
                        role="option"
                        aria-selected="false"
                        className="border-b border-zinc-100 last:border-b-0"
                      >
                        <button
                          type="button"
                          onClick={() => handleArtistSelectFromDropdown(artist)}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-zinc-50"
                        >
                          <Image
                            src={
                              artist.artworkUrl100 ??
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect fill='%23e4e4e7' width='40' height='40'/%3E%3Cpath fill='%23a1a1aa' d='M20 18a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm0 2c-5 0-8 2.5-8 5v5h16v-5c0-2.5-3-5-8-5z'/%3E%3C/svg%3E"
                            }
                            alt={`${artist.artistName} 프로필`}
                            width={40}
                            height={40}
                            unoptimized
                            className="h-10 w-10 shrink-0 rounded-lg bg-zinc-200 object-cover"
                          />
                          <div className="min-w-0 flex-1 text-left">
                            <div className="truncate text-sm font-medium text-black">
                              {artist.artistName}
                            </div>
                            {artist.primaryGenreName && (
                              <div className="truncate text-xs text-zinc-400">
                                {artist.primaryGenreName}
                              </div>
                            )}
                          </div>
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              )}
            </div>
          </div>
        </form>

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
                const ratingInfo = albumRatings[album.collectionId.toString()];
                const ratingValue =
                  ratingInfo?.reviewCount && ratingInfo.averageRating != null
                    ? ratingInfo.averageRating.toFixed(1)
                    : "-";
                const isHighRating =
                  ratingInfo?.reviewCount != null &&
                  ratingInfo.reviewCount > 0 &&
                  ratingInfo.averageRating != null &&
                  ratingInfo.averageRating >= 9;

                return (
                  <div
                    key={album.collectionId}
                    className="flex flex-col rounded-2xl bg-white p-4"
                  >
                    <div className="text-left">
                      <div className="relative mb-3 aspect-square overflow-hidden rounded-xl">
                        {album.imageUrl600 ? (
                          <Image
                            src={album.imageUrl600}
                            alt={album.collectionName}
                            fill
                            unoptimized
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-zinc-100 text-xs text-zinc-400">
                            이미지 없음
                          </div>
                        )}
                      </div>

                      <div className="flex-1 space-y-1 min-h-[80px]">
                        <h3 className="line-clamp-2 text-sm font-semibold text-zinc-900 min-h-[2.5rem]">
                          {album.collectionName}
                        </h3>
                        <p className="line-clamp-1 text-xs text-zinc-600">
                          {album.artistName}
                        </p>
                        {album.primaryGenreName && (
                          <p className="text-[11px] text-zinc-500">
                            {album.primaryGenreName}
                          </p>
                        )}
                        {album.releaseDate && (
                          <p className="text-[11px] text-zinc-500">
                            {new Date(album.releaseDate).getFullYear()}
                          </p>
                        )}
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-[10px] text-zinc-600">평점:</span>
                          <span
                            className={`text-sm font-bold ${
                              isHighRating ? "text-red-600" : "text-zinc-900"
                            }`}
                          >
                            {ratingValue}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(album);
                        }}
                        className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold transition ${
                          favoriteAlbumIds.has(album.collectionId.toString())
                            ? "border-red-500 bg-red-50 text-red-500"
                            : "border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50"
                        }`}
                        aria-label="좋아요"
                      >
                        {favoriteAlbumIds.has(album.collectionId.toString())
                          ? "❤️"
                          : "♡"}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/review/album/${encodeURIComponent(album.collectionId.toString())}`);
                        }}
                        className="flex-1 rounded-full border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50"
                      >
                        리뷰 보기
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                            void handleRegister(album);
                        }}
                        className="flex-1 rounded-full bg-[var(--color-brand-primary)] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[var(--color-brand-primary-hover)]"
                      >
                        리뷰 작성
                      </button>
                    </div>
                  </div>
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => setIsDuplicateModalOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-zinc-900">리뷰 작성 불가</h3>
            <p className="mt-2 text-sm text-zinc-600">
              동일한 앨범에는 리뷰를 1개만 작성할 수 있습니다.
            </p>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setIsDuplicateModalOpen(false)}
                className="rounded-full bg-[var(--color-brand-primary)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--color-brand-primary-hover)]"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

