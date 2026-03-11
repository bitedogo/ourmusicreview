"use client";

import { useEffect, useState } from "react";
import { reorderById } from "@/src/lib/utils/reorder";
import Image from "next/image";
import { fetchJson, getApiErrorMessage } from "@/src/lib/http/client";
const MIN_COUNT = 10;
const MAX_COUNT = 30;

interface ArtistResult {
  artistId: number;
  artistName: string;
  primaryGenreName?: string;
}

interface SearchAlbum {
  collectionId: number;
  collectionName: string;
  artistName: string;
  imageUrl600: string | null;
}

interface SlideAlbum {
  id: string;
  position: number;
  collectionId: string;
  title: string;
  artist: string;
  imageUrl: string | null;
  releaseDate: string;
  genre: string;
}

interface FeaturedSlideListResponse {
  ok: true;
  data: {
    albums: SlideAlbum[];
  };
}

export function FeaturedSlideClient() {
  const [albums, setAlbums] = useState<SlideAlbum[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [artists, setArtists] = useState<ArtistResult[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<ArtistResult | null>(null);
  const [artistAlbums, setArtistAlbums] = useState<SearchAlbum[]>([]);
  const [isSearchingArtists, setIsSearchingArtists] = useState(false);
  const [isLoadingAlbums, setIsLoadingAlbums] = useState(false);
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  useEffect(() => {
    fetchAlbums();
  }, []);

  async function fetchAlbums() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchJson<FeaturedSlideListResponse>("/api/admin/featured-slide");
      setAlbums(data.data.albums ?? []);
    } catch (err) {
      setError(getApiErrorMessage(err, "목록을 불러오는 중 오류가 발생했습니다."));
      setAlbums([]);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleArtistSearch(e?: React.FormEvent) {
    e?.preventDefault();
    const term = searchQuery.trim();
    if (!term) {
      setArtists([]);
      setSelectedArtist(null);
      setArtistAlbums([]);
      return;
    }
    setIsSearchingArtists(true);
    setSelectedArtist(null);
    setArtistAlbums([]);
    setAddError(null);
    try {
      const data = await fetchJson<{ ok: true; data: { artists: ArtistResult[] } }>(
        `/api/itunes/artists?term=${encodeURIComponent(term)}`
      );
      setArtists(Array.isArray(data.data?.artists) ? data.data.artists : []);
    } catch (error) {
      setAddError(getApiErrorMessage(error, "아티스트 검색 중 오류가 발생했습니다."));
      setArtists([]);
    } finally {
      setIsSearchingArtists(false);
    }
  }

  async function handleArtistSelect(artist: ArtistResult) {
    setSelectedArtist(artist);
    setIsLoadingAlbums(true);
    setArtistAlbums([]);
    try {
      const data = await fetchJson<{ ok: true; data: { albums: SearchAlbum[] } }>(
        `/api/itunes/artists/${artist.artistId}/albums`
      );
      setArtistAlbums(Array.isArray(data.data?.albums) ? data.data.albums : []);
    } catch (error) {
      setAddError(getApiErrorMessage(error, "앨범 목록 로딩 중 오류가 발생했습니다."));
      setArtistAlbums([]);
    } finally {
      setIsLoadingAlbums(false);
    }
  }

  function openAddModal() {
    setAddError(null);
    setSearchQuery("");
    setArtists([]);
    setSelectedArtist(null);
    setArtistAlbums([]);
    setModalOpen(true);
  }

  async function addAlbum(collectionId: number) {
    if (albums.length >= MAX_COUNT) {
      setAddError(`최대 ${MAX_COUNT}개까지 등록할 수 있습니다.`);
      return;
    }
    setAddSubmitting(true);
    setAddError(null);
    try {
      const data = await fetchJson<{ ok: true; data: { album: SlideAlbum | null } }>(
        "/api/admin/featured-slide",
        {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collectionId }),
        }
      );
      const createdAlbum = data.data.album;
      if (createdAlbum) {
        setAlbums((prev) => [...prev, createdAlbum]);
      }
      setModalOpen(false);
    } catch (err) {
      setAddError(getApiErrorMessage(err, "추가 중 오류가 발생했습니다."));
    } finally {
      setAddSubmitting(false);
    }
  }

  async function removeAlbum(id: string) {
    if (albums.length <= MIN_COUNT) {
      alert(`최소 ${MIN_COUNT}개는 유지해야 합니다.`);
      return;
    }
    if (!confirm("이 앨범을 슬라이드바에서 제거할까요?")) return;
    setProcessingIds((prev) => new Set(prev).add(id));
    try {
      await fetchJson<{ ok: true }>(
        `/api/admin/featured-slide?id=${encodeURIComponent(id)}`,
        { method: "DELETE" }
      );
      setAlbums((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      alert(getApiErrorMessage(err, "삭제 중 오류가 발생했습니다."));
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  function getReorderedAlbums(sourceId: string, targetId: string): SlideAlbum[] {
    return reorderById(albums, sourceId, targetId);
  }

  async function handleDrop(targetId: string) {
    if (!draggingId || draggingId === targetId) return;
    const next = getReorderedAlbums(draggingId, targetId);
    if (next === albums) return;
    await saveOrder(next.map((a) => a.id));
  }

  async function saveOrder(ids: string[]) {
    setIsSavingOrder(true);
    try {
      await fetchJson<{ ok: true }>("/api/admin/featured-slide", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: ids }),
      });
      setAlbums((prev) => {
        const byId = new Map(prev.map((a) => [a.id, a]));
        return ids
          .map((id, i) => {
            const a = byId.get(id);
            return a ? { ...a, position: i + 1 } : null;
          })
          .filter((a): a is SlideAlbum => a !== null);
      });
    } catch (err) {
      alert(getApiErrorMessage(err, "순서 저장 중 오류가 발생했습니다."));
    } finally {
      setIsSavingOrder(false);
      setDraggingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-zinc-900">명반 슬라이드바 관리</h1>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-zinc-600">
            현재 <strong>{albums.length}</strong>개 / {MAX_COUNT}개
          </span>
          {albums.length < MIN_COUNT && (
            <span className="hidden rounded bg-amber-100 px-2 py-1 text-xs text-amber-800 sm:inline">
              최소 {MIN_COUNT}개 이상
            </span>
          )}
          <button
            type="button"
            onClick={openAddModal}
            disabled={albums.length >= MAX_COUNT || isLoading}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            앨범 추가
          </button>
        </div>
      </div>
      <p className="mb-3 text-xs text-zinc-500">
        항목을 드래그해서 순서를 변경할 수 있습니다.
      </p>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="py-12 text-center text-sm text-zinc-500">
          목록을 불러오는 중...
        </div>
      ) : albums.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 py-12 text-center text-sm text-zinc-600">
          등록된 앨범이 없습니다. 앨범 추가로 최소 {MIN_COUNT}개를 등록해 주세요.
        </div>
      ) : (
        <ul className="space-y-2">
          {albums.map((album, index) => (
            <li
              key={album.id}
              draggable={!isSavingOrder}
              onDragStart={() => setDraggingId(album.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(album.id)}
              onDragEnd={() => setDraggingId(null)}
              className={`flex cursor-grab items-center gap-4 rounded-lg border border-zinc-200 bg-white p-3 active:cursor-grabbing ${
                draggingId === album.id ? "opacity-60" : ""
              }`}
            >
              <span className="shrink-0 text-zinc-400">⋮⋮</span>
              <span className="w-6 shrink-0 text-right text-sm text-zinc-400">
                {index + 1}
              </span>
              {album.imageUrl ? (
                <Image
                  src={album.imageUrl}
                  alt={album.title ?? "앨범 커버"}
                  width={48}
                  height={48}
                  unoptimized
                  className="h-12 w-12 shrink-0 rounded object-cover"
                />
              ) : (
                <div className="h-12 w-12 shrink-0 rounded bg-zinc-200" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-zinc-900">{album.title}</p>
                <p className="truncate text-sm text-zinc-600">{album.artist}</p>
              </div>
              <button
                type="button"
                onClick={() => removeAlbum(album.id)}
                disabled={albums.length <= MIN_COUNT || processingIds.has(album.id)}
                className="shrink-0 rounded px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                {processingIds.has(album.id) ? "처리 중..." : "삭제"}
              </button>
            </li>
          ))}
        </ul>
      )}

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-album-title"
        >
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <h2 id="add-album-title" className="text-lg font-bold text-zinc-900">
              앨범 추가
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              아티스트 검색 후 앨범을 선택하세요.
            </p>

            <form onSubmit={handleArtistSearch} className="mt-4 flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="아티스트 검색"
                className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              />
              <button
                type="submit"
                disabled={isSearchingArtists}
                className="rounded-lg bg-zinc-800 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
              >
                {isSearchingArtists ? "검색 중..." : "검색"}
              </button>
            </form>

            {addError && (
              <p className="mt-2 text-sm text-red-600">{addError}</p>
            )}

            {!selectedArtist && artists.length > 0 && (
              <ul className="mt-4 max-h-48 overflow-y-auto rounded-lg border border-zinc-200">
                {artists.map((a) => (
                  <li key={a.artistId}>
                    <button
                      type="button"
                      onClick={() => handleArtistSelect(a)}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-zinc-50"
                    >
                      {a.artistName}
                      {a.primaryGenreName ? ` · ${a.primaryGenreName}` : ""}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {selectedArtist && (
              <>
                <div className="mt-4 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedArtist(null);
                      setArtistAlbums([]);
                    }}
                    className="text-sm text-zinc-600 hover:underline"
                  >
                    ← 아티스트 다시 선택
                  </button>
                </div>
                {isLoadingAlbums ? (
                  <p className="mt-2 text-sm text-zinc-500">앨범 목록 불러오는 중...</p>
                ) : artistAlbums.length === 0 ? (
                  <p className="mt-2 text-sm text-zinc-500">앨범이 없습니다.</p>
                ) : (
                  <ul className="mt-2 max-h-64 overflow-y-auto rounded-lg border border-zinc-200">
                    {artistAlbums.map((album) => (
                      <li key={album.collectionId}>
                        <button
                          type="button"
                          disabled={addSubmitting}
                          onClick={() => addAlbum(album.collectionId)}
                          className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm hover:bg-zinc-50 disabled:opacity-50"
                        >
                          {album.imageUrl600 ? (
                            <Image
                              src={album.imageUrl600}
                              alt={album.collectionName ?? "앨범 커버"}
                              width={40}
                              height={40}
                              unoptimized
                              className="h-10 w-10 shrink-0 rounded object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 shrink-0 rounded bg-zinc-200" />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">{album.collectionName}</p>
                            <p className="truncate text-zinc-600">{album.artistName}</p>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
