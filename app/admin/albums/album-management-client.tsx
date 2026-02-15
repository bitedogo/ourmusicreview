"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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

interface TodayAlbumItem {
  displayDate: string;
  title: string;
  artist: string;
  imageUrl: string | null;
  description: string | null;
}

export function AlbumManagementClient() {
  const router = useRouter();
  const [albums, setAlbums] = useState<TodayAlbumItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [form, setForm] = useState({
    displayDate: "",
    title: "",
    artist: "",
    imageUrl: "",
    description: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [artists, setArtists] = useState<ArtistResult[]>([]);
  const [selectedArtist, setSelectedArtist] = useState<ArtistResult | null>(null);
  const [artistAlbums, setArtistAlbums] = useState<SearchAlbum[]>([]);
  const [isSearchingArtists, setIsSearchingArtists] = useState(false);
  const [isLoadingAlbums, setIsLoadingAlbums] = useState(false);

  useEffect(() => {
    fetchAlbums();
  }, []);

  async function fetchAlbums() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/albums");
      const data = await response.json();

      if (!response.ok || !data?.ok) {
        setError(data?.error ?? "목록을 불러올 수 없습니다.");
        return;
      }

      setAlbums(data.albums || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "목록을 불러오는 중 오류가 발생했습니다."
      );
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
    try {
      const response = await fetch(`/api/itunes/artists?term=${encodeURIComponent(term)}`);
      const data = await response.json();
      if (data.ok && Array.isArray(data.artists)) {
        setArtists(data.artists);
      } else {
        setArtists([]);
      }
    } catch {
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
      const response = await fetch(`/api/itunes/artists/${artist.artistId}/albums`);
      const data = await response.json();
      if (data.ok && Array.isArray(data.albums)) {
        setArtistAlbums(data.albums);
      } else {
        setArtistAlbums([]);
      }
    } catch {
      setArtistAlbums([]);
    } finally {
      setIsLoadingAlbums(false);
    }
  }

  function handleBackToArtists() {
    setSelectedArtist(null);
    setArtistAlbums([]);
  }

  function selectAlbum(album: SearchAlbum) {
    setForm((f) => ({
      ...f,
      title: album.collectionName,
      artist: album.artistName,
      imageUrl: album.imageUrl600 ?? "",
    }));
    setSelectedArtist(null);
    setArtistAlbums([]);
    setArtists([]);
    setSearchQuery("");
  }

  function openAddModal() {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    setForm({
      displayDate: `${y}-${m}-${d}`,
      title: "",
      artist: "",
      imageUrl: "",
      description: "",
    });
    setSearchQuery("");
    setArtists([]);
    setSelectedArtist(null);
    setArtistAlbums([]);
    setEditingDate(null);
    setModalOpen(true);
  }

  function openEditModal(item: TodayAlbumItem) {
    setForm({
      displayDate: item.displayDate,
      title: item.title,
      artist: item.artist,
      imageUrl: item.imageUrl ?? "",
      description: item.description ?? "",
    });
    setSearchQuery("");
    setArtists([]);
    setSelectedArtist(null);
    setArtistAlbums([]);
    setEditingDate(item.displayDate);
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const payload = {
      displayDate: form.displayDate,
      title: form.title.trim(),
      artist: form.artist.trim(),
      imageUrl: form.imageUrl.trim() || undefined,
      description: form.description.trim() || undefined,
    };

    if (!payload.title || !payload.artist) {
      alert("제목과 아티스트는 필수입니다.");
      return;
    }

    const existingDates = albums.map((a) => a.displayDate);
    if (!editingDate && existingDates.includes(form.displayDate)) {
      if (!confirm(`${form.displayDate}에 이미 등록된 앨범이 있습니다. 덮어쓰시겠습니까?`)) {
        return;
      }
    }

    setProcessingIds((prev) => new Set(prev).add("submit"));
    try {
      const response = await fetch("/api/admin/albums", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok || !data?.ok) {
        alert(data?.error ?? "저장에 실패했습니다.");
        return;
      }

      setModalOpen(false);
      fetchAlbums();
    } catch (err) {
      alert(err instanceof Error ? err.message : "저장 중 오류가 발생했습니다.");
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete("submit");
        return next;
      });
    }
  }

  async function handleDelete(displayDate: string) {
    if (!confirm(`${displayDate} 앨범을 삭제하시겠습니까?`)) return;

    setProcessingIds((prev) => new Set(prev).add(displayDate));
    try {
      const response = await fetch(
        `/api/admin/albums/${encodeURIComponent(displayDate)}`,
        { method: "DELETE" }
      );
      const data = await response.json();

      if (!response.ok || !data?.ok) {
        alert(data?.error ?? "삭제에 실패했습니다.");
        return;
      }

      setAlbums((prev) => prev.filter((a) => a.displayDate !== displayDate));
    } catch (err) {
      alert(err instanceof Error ? err.message : "삭제 중 오류가 발생했습니다.");
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(displayDate);
        return next;
      });
    }
  }

  const takenDates = albums.map((a) => a.displayDate);

  const todayStr = (() => {
    const t = new Date();
    const y = t.getFullYear();
    const m = String(t.getMonth() + 1).padStart(2, "0");
    const d = String(t.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  })();

  const isPastDate = (displayDate: string) => displayDate < todayStr;

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-6 py-10 sm:px-16">
        <div className="flex items-center justify-center py-12">
          <div className="text-sm text-zinc-500">목록을 불러오는 중...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-6 py-10 sm:px-16">
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {error}
        </div>
        <button
          onClick={() => router.back()}
          className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
        >
          뒤로 가기
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-6 py-10 sm:px-16">
      <section className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">오늘의 앨범 관리</h1>
        <button
          type="button"
          onClick={openAddModal}
          className="rounded-full border border-zinc-200 bg-zinc-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-black"
        >
          오늘의 앨범 등록
        </button>
      </section>

      {albums.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-8 text-center text-sm text-zinc-500">
          등록된 오늘의 앨범이 없습니다.
        </div>
      ) : (
        <div className="overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50 text-[11px] font-semibold text-zinc-500">
                  <th className="px-3 py-2 text-left">날짜</th>
                  <th className="px-3 py-2 text-left">제목</th>
                  <th className="px-3 py-2 text-left">아티스트</th>
                  <th className="px-3 py-2 text-left">처리</th>
                </tr>
              </thead>
              <tbody>
                {albums.map((item) => (
                  <tr key={item.displayDate} className="hover:bg-zinc-50">
                    <td className="px-3 py-2 align-middle">
                      <span className="text-xs font-medium text-zinc-900">
                        {item.displayDate}
                      </span>
                    </td>
                    <td className="max-w-[220px] px-3 py-2 align-middle">
                      <span className="truncate text-xs font-semibold text-zinc-900">
                        {item.title}
                      </span>
                    </td>
                    <td className="px-3 py-2 align-middle">
                      <span className="text-xs text-zinc-700">{item.artist}</span>
                    </td>
                    <td className="px-3 py-2 text-left align-middle">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          disabled={processingIds.has(item.displayDate) || isPastDate(item.displayDate)}
                          className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-[11px] font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          수정
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.displayDate)}
                          disabled={processingIds.has(item.displayDate) || isPastDate(item.displayDate)}
                          className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-[11px] font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold tracking-tight text-zinc-900">
              {editingDate ? "오늘의 앨범 수정" : "오늘의 앨범 등록"}
            </h2>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-zinc-600">
                  앨범 검색
                </label>
                <p className="mb-2 text-[11px] text-zinc-500">
                  아티스트를 검색한 뒤 선택하고, 앨범을 골라 등록하세요.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleArtistSearch())}
                    placeholder="아티스트 이름으로 검색"
                    className="flex-1 rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
                  />
                  <button
                    type="button"
                    onClick={() => handleArtistSearch()}
                    disabled={isSearchingArtists}
                    className="rounded-lg border border-zinc-200 bg-zinc-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSearchingArtists ? "검색 중..." : "검색"}
                  </button>
                </div>

                {!selectedArtist && artists.length > 0 && (
                  <div className="mt-3 max-h-40 overflow-auto rounded-lg border border-zinc-200">
                    {artists.map((artist) => (
                      <button
                        key={artist.artistId}
                        type="button"
                        onClick={() => handleArtistSelect(artist)}
                        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left transition hover:bg-zinc-50"
                      >
                        <span className="truncate text-xs font-semibold text-zinc-900">
                          {artist.artistName}
                        </span>
                        {artist.primaryGenreName && (
                          <span className="shrink-0 text-[11px] text-zinc-500">
                            {artist.primaryGenreName}
                          </span>
                        )}
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0 text-zinc-400">
                          <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    ))}
                  </div>
                )}

                {selectedArtist && (
                  <div className="mt-3">
                    <div className="mb-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleBackToArtists}
                        className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-[11px] font-medium text-zinc-600 transition hover:bg-zinc-50"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        아티스트 목록으로
                      </button>
                      <span className="text-xs font-semibold text-zinc-700">
                        {selectedArtist.artistName}의 앨범
                      </span>
                    </div>
                    {isLoadingAlbums ? (
                      <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-6 text-center text-xs text-zinc-500">
                        앨범 목록을 불러오는 중...
                      </div>
                    ) : artistAlbums.length > 0 ? (
                      <div className="max-h-48 overflow-auto rounded-lg border border-zinc-200">
                        {artistAlbums.map((album) => (
                          <button
                            key={album.collectionId}
                            type="button"
                            onClick={() => selectAlbum(album)}
                            className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-zinc-50"
                          >
                            <div className="h-10 w-10 shrink-0 overflow-hidden rounded bg-zinc-100">
                              {album.imageUrl600 ? (
                                <img src={album.imageUrl600} alt="" className="h-full w-full object-cover" />
                              ) : null}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-semibold text-zinc-900">
                                {album.collectionName}
                              </p>
                              <p className="truncate text-[11px] text-zinc-500">
                                {album.artistName}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-6 text-center text-xs text-zinc-500">
                        등록된 앨범이 없습니다.
                      </div>
                    )}
                  </div>
                )}

                {!isSearchingArtists && !selectedArtist && artists.length === 0 && searchQuery && (
                  <p className="mt-2 text-xs text-zinc-500">검색 결과가 없습니다.</p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-zinc-600">
                  노출 날짜
                </label>
                <input
                  type="date"
                  value={form.displayDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, displayDate: e.target.value }))
                  }
                  required
                  disabled={!!editingDate}
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 disabled:bg-zinc-100 disabled:text-zinc-500"
                />
                {!editingDate && takenDates.includes(form.displayDate) && (
                  <p className="mt-1 text-xs text-amber-600">
                    이 날짜에 이미 등록된 앨범이 있습니다. 저장 시 덮어쓰기됩니다.
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-zinc-600">
                  제목
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  required
                  placeholder="앨범 제목"
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-zinc-600">
                  아티스트
                </label>
                <input
                  type="text"
                  value={form.artist}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, artist: e.target.value }))
                  }
                  required
                  placeholder="아티스트명"
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
                />
              </div>
              {form.imageUrl && (
                <div>
                  <label className="mb-1 block text-xs font-semibold text-zinc-600">
                    앨범 커버
                  </label>
                  <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                    <img
                      src={form.imageUrl}
                      alt=""
                      className="h-16 w-16 shrink-0 rounded object-cover"
                    />
                    <p className="text-xs text-zinc-600">
                      선택된 앨범의 커버 이미지입니다.
                    </p>
                  </div>
                </div>
              )}
              <div>
                <label className="mb-1 block text-xs font-semibold text-zinc-600">
                  추천평
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  rows={4}
                  placeholder="관리자 추천 한마디"
                  className="w-full resize-none rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={processingIds.has("submit")}
                  className="rounded-lg border border-zinc-900 bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {processingIds.has("submit") ? "처리 중..." : "저장"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
