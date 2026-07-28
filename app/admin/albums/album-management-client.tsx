"use client";
/** 관리자 오늘의 앨범 관리 클라이언트 */

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useItunesAlbumPicker } from "@/src/hooks/use-itunes-album-picker";
import { fetchJson, getApiErrorMessage } from "@/src/lib/http/client";
import type { SearchAlbumResult } from "@/src/lib/search/types";
import { AlbumTable } from "./AlbumTable";
import { AlbumFormModal } from "./AlbumFormModal";
import type { AlbumsListResponse, TodayAlbumFormState, TodayAlbumItem } from "./types";

const EMPTY_FORM: TodayAlbumFormState = {
  displayDate: "",
  albumId: "",
  title: "",
  artist: "",
  imageUrl: "",
  description: "",
};

export function AlbumManagementClient() {
  const router = useRouter();
  const [albums, setAlbums] = useState<TodayAlbumItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [form, setForm] = useState<TodayAlbumFormState>(EMPTY_FORM);
  const albumPicker = useItunesAlbumPicker();
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 20;

  useEffect(() => {
    fetchAlbums();
  }, []);

  useEffect(() => {
    const total = Math.ceil(albums.length / PAGE_SIZE) || 1;
    if (currentPage > total) setCurrentPage(total);
  }, [albums.length, currentPage]);

  async function fetchAlbums() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchJson<AlbumsListResponse>("/api/admin/albums");
      setAlbums(data.data.albums || []);
      setCurrentPage(1);
    } catch (err) {
      setError(getApiErrorMessage(err, "목록을 불러오는 중 오류가 발생했습니다."));
    } finally {
      setIsLoading(false);
    }
  }

  function selectAlbum(album: SearchAlbumResult) {
    setForm((f) => ({
      ...f,
      albumId: album.collectionId,
      title: album.collectionName,
      artist: album.artistName,
      imageUrl: album.imageUrl600 ?? "",
    }));
    albumPicker.reset();
  }

  function openAddModal() {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    setForm({
      displayDate: `${y}-${m}-${d}`,
      albumId: "",
      title: "",
      artist: "",
      imageUrl: "",
      description: "",
    });
    albumPicker.reset();
    setEditingDate(null);
    setModalOpen(true);
  }

  function openEditModal(item: TodayAlbumItem) {
    setForm({
      displayDate: item.displayDate,
      albumId: item.albumId ?? "",
      title: item.title,
      artist: item.artist,
      imageUrl: item.imageUrl ?? "",
      description: item.description ?? "",
    });
    albumPicker.reset();
    setEditingDate(item.displayDate);
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const payload = {
      displayDate: form.displayDate,
      albumId: form.albumId.trim() || undefined,
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
      await fetchJson<{ ok: true }>("/api/admin/albums", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setModalOpen(false);
      fetchAlbums();
    } catch (err) {
      alert(getApiErrorMessage(err, "저장 중 오류가 발생했습니다."));
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
      await fetchJson<{ ok: true }>(
        `/api/admin/albums/${encodeURIComponent(displayDate)}`,
        { method: "DELETE" }
      );
      setAlbums((prev) => prev.filter((a) => a.displayDate !== displayDate));
    } catch (err) {
      alert(getApiErrorMessage(err, "삭제 중 오류가 발생했습니다."));
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(displayDate);
        return next;
      });
    }
  }

  const takenDates = albums.map((a) => a.displayDate);
  const totalPages = Math.ceil(albums.length / PAGE_SIZE) || 1;
  const paginatedAlbums = albums.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

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
        <AlbumTable
          albums={paginatedAlbums}
          processingIds={processingIds}
          isPastDate={isPastDate}
          onEdit={openEditModal}
          onDelete={handleDelete}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {modalOpen && (
        <AlbumFormModal
          form={form}
          onFormChange={setForm}
          editingDate={editingDate}
          takenDates={takenDates}
          albumPicker={albumPicker}
          onAlbumSelect={selectAlbum}
          isSubmitting={processingIds.has("submit")}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
