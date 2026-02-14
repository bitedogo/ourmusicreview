"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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

export function SearchClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);
  const [artists, setArtists] = useState<ArtistResult[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<ArtistResult | null>(null);
  const [albums, setAlbums] = useState<AlbumResult[]>([]);
  const [isLoadingAlbums, setIsLoadingAlbums] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [albumRatings, setAlbumRatings] = useState<Record<string, { averageRating: number | null; reviewCount: number }>>({});
  const [favoriteAlbumIds, setFavoriteAlbumIds] = useState<Set<string>>(new Set());

  async function handleSearch(term: string) {
    if (!term.trim()) {
      setArtists([]);
      setSelectedArtist(null);
      setAlbums([]);
      return;
    }

    setIsSearching(true);
    setErrorMessage(null);
    setSelectedArtist(null);
    setAlbums([]);

    try {
      const response = await fetch(`/api/itunes/artists?term=${encodeURIComponent(term)}`);
      const data = await response.json();

      if (!response.ok || !data.ok) {
        setErrorMessage(
          data?.error ?? `검색에 실패했습니다. (status: ${response.status})`
        );
        setArtists([]);
        return;
      }

      setArtists(data.artists || []);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? `검색 중 오류가 발생했습니다: ${error.message}`
          : "검색 중 알 수 없는 오류가 발생했습니다."
      );
      setArtists([]);
    } finally {
      setIsSearching(false);
    }
  }

  async function handleArtistSelect(artist: ArtistResult) {
    setSelectedArtist(artist);
    setIsLoadingAlbums(true);
    setAlbums([]);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/itunes/artists/${artist.artistId}/albums`);
      const data = await response.json();

      if (!response.ok || !data.ok) {
        setErrorMessage(
          data?.error ?? `앨범 목록을 불러오는데 실패했습니다. (status: ${response.status})`
        );
        setAlbums([]);
        return;
      }

      setAlbums(data.albums || []);
      
      if (data.albums && data.albums.length > 0) {
        const ratings: Record<string, { averageRating: number | null; reviewCount: number }> = {};
        await Promise.all(
          data.albums.map(async (album: AlbumResult) => {
            try {
              const ratingResponse = await fetch(
                `/api/albums/${encodeURIComponent(album.collectionId.toString())}/rating`
              );
              const ratingData = await ratingResponse.json();
              if (ratingResponse.ok && ratingData?.ok) {
                if (ratingData.reviewCount > 0 && ratingData.averageRating !== null) {
                  ratings[album.collectionId.toString()] = {
                    averageRating: ratingData.averageRating,
                    reviewCount: ratingData.reviewCount,
                  };
                }
              }
            } catch {
            }
          })
        );
        setAlbumRatings(ratings);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? `앨범 목록 조회 중 오류가 발생했습니다: ${error.message}`
          : "앨범 목록 조회 중 알 수 없는 오류가 발생했습니다."
      );
      setAlbums([]);
    } finally {
      setIsLoadingAlbums(false);
    }
  }

  async function handleRegister(album: AlbumResult) {
    const params = new URLSearchParams({
      albumId: album.collectionId.toString(),
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
        const response = await fetch("/api/favorites", {
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

        if (response.status === 401) {
          router.push("/auth/signin?callbackUrl=/search");
          return;
        }

        const data = await response.json().catch(() => null);
        if (!response.ok || !data?.ok) {
          return;
        }

        setFavoriteAlbumIds((prev) => {
          const next = new Set(prev);
          next.add(albumId);
          return next;
        });
      } else {
        const response = await fetch("/api/favorites", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ albumId }),
        });

        if (response.status === 401) {
          router.push("/auth/signin?callbackUrl=/search");
          return;
        }

        const data = await response.json().catch(() => null);
        if (!response.ok || !data?.ok) {
          return;
        }

        setFavoriteAlbumIds((prev) => {
          const next = new Set(prev);
          next.delete(albumId);
          return next;
        });
      }
    } catch {
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    handleSearch(trimmed);
  }

  function handleBackToArtists() {
    setSelectedArtist(null);
    setAlbums([]);
  }

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    async function fetchRatings() {
      if (albums.length === 0) {
        setAlbumRatings({});
        return;
      }

      const ratings: Record<string, { averageRating: number | null; reviewCount: number }> = {};
      await Promise.all(
        albums.map(async (album) => {
          try {
            const ratingResponse = await fetch(
              `/api/albums/${encodeURIComponent(album.collectionId.toString())}/rating`
            );
            const ratingData = await ratingResponse.json();
            if (ratingResponse.ok && ratingData?.ok) {
              if (ratingData.reviewCount > 0 && ratingData.averageRating !== null) {
                ratings[album.collectionId.toString()] = {
                  averageRating: ratingData.averageRating,
                  reviewCount: ratingData.reviewCount,
                };
              }
            }
          } catch {
          }
        })
      );
      setAlbumRatings(ratings);
    }

    fetchRatings();
  }, [albums]);

  useEffect(() => {
    async function fetchFavorites() {
      try {
        const response = await fetch("/api/favorites");
        if (response.status === 401) {
          return;
        }
        const data = await response.json().catch(() => null);
        if (!response.ok || !data?.ok) {
          return;
        }
        const ids = new Set<string>();
        for (const fav of data.favorites || []) {
          if (fav.albumId) {
            ids.add(String(fav.albumId));
          }
        }
        setFavoriteAlbumIds(ids);
      } catch {
      }
    }

    fetchFavorites();
  }, []);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-6 py-10 sm:px-10">
      <section className="space-y-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
            앨범 검색
          </h1>
          <p className="mt-1 text-xs text-zinc-600">
            아티스트를 검색하고 앨범을 선택하여 등록하세요.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-400">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10.5 18.5C14.9183 18.5 18.5 14.9183 18.5 10.5C18.5 6.08172 14.9183 2.5 10.5 2.5C6.08172 2.5 2.5 6.08172 2.5 10.5C2.5 14.9183 6.08172 18.5 10.5 18.5Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M21.5 21.5L17.2 17.2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-zinc-200 bg-white px-11 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
              placeholder="아티스트 이름으로 검색해보세요"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="inline-flex items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-zinc-400"
          >
            {isSearching ? "검색 중..." : "검색"}
          </button>
        </form>

        {errorMessage && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
            {errorMessage}
          </div>
        )}
      </section>

      {/* 아티스트 목록 */}
      {!selectedArtist && artists.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold tracking-tight text-zinc-900">
              아티스트 검색 결과 ({artists.length}개)
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {artists.map((artist) => (
              <button
                key={artist.artistId}
                type="button"
                onClick={() => handleArtistSelect(artist)}
                className="rounded-xl border border-zinc-200 bg-white p-4 text-left shadow-sm transition-all hover:border-zinc-300 hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="truncate text-sm font-semibold text-zinc-900">
                      {artist.artistName}
                    </h3>
                    {artist.primaryGenreName && (
                      <p className="truncate text-xs text-zinc-500">
                        {artist.primaryGenreName}
                      </p>
                    )}
                  </div>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-zinc-400"
                  >
                    <path
                      d="M9 18L15 12L9 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 선택된 아티스트의 앨범 목록 */}
      {selectedArtist && (
        <section>
          <div className="mb-4 flex items-center gap-3">
            <button
              type="button"
              onClick={handleBackToArtists}
              className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15 18L9 12L15 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              아티스트 목록으로
            </button>
            <div>
              <h2 className="text-base font-semibold tracking-tight text-zinc-900">
                {selectedArtist.artistName}의 앨범
              </h2>
            </div>
          </div>

          {isLoadingAlbums ? (
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-8 text-center text-sm text-zinc-500">
              앨범 목록을 불러오는 중...
            </div>
          ) : albums.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {albums.map((album) => {
                return (
                  <div
                    key={album.collectionId}
                    className="flex flex-col rounded-2xl bg-white p-4"
                  >
                    <div className="text-left">
                      <div className="relative mb-3 aspect-square overflow-hidden rounded-xl">
                        {album.imageUrl600 ? (
                          <img
                            src={album.imageUrl600}
                            alt={album.collectionName}
                            className="h-full w-full object-contain"
                            loading="lazy"
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
                        {albumRatings[album.collectionId.toString()] && 
                         albumRatings[album.collectionId.toString()].averageRating !== null &&
                         albumRatings[album.collectionId.toString()].reviewCount > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-xs font-semibold text-zinc-900">
                              ⭐ {albumRatings[album.collectionId.toString()].averageRating?.toFixed(1)}
                            </span>
                            <span className="text-[10px] text-zinc-500">
                              ({albumRatings[album.collectionId.toString()].reviewCount})
                            </span>
                          </div>
                        )}
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
                          handleRegister(album);
                        }}
                        className="flex-1 rounded-full border border-zinc-200 bg-zinc-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-black"
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

      {!isSearching && !selectedArtist && artists.length === 0 && searchQuery && (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-6 text-center text-sm text-zinc-500">
          <p className="font-medium text-zinc-700 mb-1">검색 결과가 없습니다.</p>
          <p className="text-xs">
            애플 뮤직에 등록되지 않은 아티스트일 수 있습니다. 다른 검색어로 시도해보세요.
          </p>
        </div>
      )}

      {!isSearching && !selectedArtist && artists.length === 0 && !searchQuery && (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-6 text-center text-sm text-zinc-500">
          위 검색창에 아티스트 이름을 입력하고 검색해보세요.
        </div>
      )}
    </div>
  );
}
