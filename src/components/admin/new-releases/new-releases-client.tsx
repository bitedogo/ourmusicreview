"use client";
/** 관리자 주간 신보 클라이언트 */

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArtistNameLink } from "@/src/components/app/artist-name-link";
import { ItunesAlbumPickerModal } from "@/src/components/itunes/itunes-album-picker-modal";
import { ManualAlbumFormModal } from "@/src/components/admin/new-releases/manual-album-form-modal";
import { fetchJson, getApiErrorMessage } from "@/src/lib/http/client";
import type {
  NewReleaseAdminAlbum,
  NewReleaseAdminBucket,
} from "@/src/lib/new-releases/types";
import { formatDottedDateFromIso } from "@/src/lib/new-releases/weeks";
import { LOGO_ALT, LOGO_SRC } from "@/src/lib/site/branding";
import type { SearchAlbumResult } from "@/src/lib/search/types";

interface AdminListResponse {
  ok: true;
  data: {
    albums: NewReleaseAdminAlbum[];
  };
}

const BUCKET_LABEL: Record<NewReleaseAdminBucket, string> = {
  thisWeek: "이번 주",
  nextWeek: "다음 주",
  upcoming: "예정",
  past: "지남",
};

export function NewReleasesAdminClient() {
  const [albums, setAlbums] = useState<NewReleaseAdminAlbum[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [manualError, setManualError] = useState<string | null>(null);

  useEffect(() => {
    fetchAlbums();
  }, []);

  async function fetchAlbums() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchJson<AdminListResponse>("/api/admin/new-releases");
      setAlbums(data.data.albums ?? []);
    } catch (err) {
      setError(getApiErrorMessage(err, "목록을 불러오는 중 오류가 발생했습니다."));
      setAlbums([]);
    } finally {
      setIsLoading(false);
    }
  }

  function insertAlbum(created: NewReleaseAdminAlbum) {
    setAlbums((prev) =>
      [...prev, created].sort((a, b) =>
        a.releaseDate === b.releaseDate
          ? a.title.localeCompare(b.title)
          : a.releaseDate.localeCompare(b.releaseDate)
      )
    );
  }

  async function handleAlbumSelect(album: SearchAlbumResult) {
    setAddSubmitting(true);
    setAddError(null);
    try {
      const data = await fetchJson<{ ok: true; data: { album: NewReleaseAdminAlbum } }>(
        "/api/admin/new-releases",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            collectionId: album.collectionId,
          }),
        }
      );
      if (data.data.album) insertAlbum(data.data.album);
      setModalOpen(false);
    } catch (err) {
      setAddError(getApiErrorMessage(err, "추가 중 오류가 발생했습니다."));
    } finally {
      setAddSubmitting(false);
    }
  }

  async function handleManualSubmit(input: {
    title: string;
    artist: string;
    releaseDate: string;
    imageUrl: string;
  }) {
    setAddSubmitting(true);
    setManualError(null);
    try {
      const data = await fetchJson<{ ok: true; data: { album: NewReleaseAdminAlbum } }>(
        "/api/admin/new-releases",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            source: "manual",
            title: input.title,
            artist: input.artist,
            releaseDate: input.releaseDate,
            imageUrl: input.imageUrl.trim() ? input.imageUrl.trim() : null,
          }),
        }
      );
      if (data.data.album) insertAlbum(data.data.album);
      setManualModalOpen(false);
    } catch (err) {
      setManualError(getApiErrorMessage(err, "직접 등록 중 오류가 발생했습니다."));
    } finally {
      setAddSubmitting(false);
    }
  }

  async function removeAlbum(id: string) {
    if (!confirm("이 앨범을 신보 목록에서 제거할까요?")) return;
    setProcessingIds((prev) => new Set(prev).add(id));
    try {
      await fetchJson<{ ok: true }>(
        `/api/admin/new-releases?id=${encodeURIComponent(id)}`,
        { method: "DELETE" }
      );
      setAlbums((prev) => prev.filter((album) => album.id !== id));
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

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-[var(--color-text-primary)]">신보 등록</h1>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setManualError(null);
              setManualModalOpen(true);
            }}
            disabled={isLoading}
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-[var(--color-text-primary)] hover:bg-zinc-50 disabled:opacity-50"
          >
            직접 등록
          </button>
          <button
            type="button"
            onClick={() => {
              setAddError(null);
              setModalOpen(true);
            }}
            disabled={isLoading}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            iTunes에서 추가
          </button>
        </div>
      </div>

      <p className="mb-4 text-sm text-[var(--color-text-secondary)]">
        iTunes에서 검색하거나, 아직 카탈로그에 없는 앨범은 직접 등록하세요. 직접 등록분은 홈 Upcoming Album
        Releases에만 나가고, 발매일이 지나면 삭제됩니다.
      </p>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="py-12 text-center text-sm text-[var(--color-text-secondary)]">
          목록을 불러오는 중...
        </div>
      ) : albums.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 py-12 text-center text-sm text-[var(--color-text-secondary)]">
          등록된 앨범이 없습니다.
        </div>
      ) : (
        <ul className="space-y-2">
          {albums.map((album) => (
            <li
              key={album.id}
              className="flex items-center gap-4 rounded-lg border border-zinc-200 bg-white p-3"
            >
              {album.imageUrl ? (
                album.source === "manual" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={album.imageUrl}
                    alt={album.title ?? "앨범 커버"}
                    className="h-12 w-12 shrink-0 rounded object-cover"
                  />
                ) : (
                  <Image
                    src={album.imageUrl}
                    alt={album.title ?? "앨범 커버"}
                    width={48}
                    height={48}
                    className="h-12 w-12 shrink-0 rounded object-cover"
                  />
                )
              ) : (
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded bg-white">
                  <Image
                    src={LOGO_SRC}
                    alt={LOGO_ALT}
                    fill
                    sizes="48px"
                    className="object-contain p-1"
                  />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-[var(--color-text-primary)]">
                  {album.title}
                </p>
                {album.source === "manual" ? (
                  <p className="truncate text-sm text-[var(--color-text-secondary)]">
                    {album.artist}
                  </p>
                ) : (
                  <ArtistNameLink
                    name={album.artist}
                    artistId={album.artistId}
                    className="truncate text-left text-sm text-[var(--color-text-secondary)] transition hover:text-[var(--color-brand-primary)] hover:underline disabled:cursor-wait disabled:no-underline"
                  />
                )}
              </div>
              <span className="shrink-0 text-sm tabular-nums text-[var(--color-text-secondary)]">
                {formatDottedDateFromIso(album.releaseDate)}
              </span>
              {album.source === "manual" ? (
                <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-800">
                  직접
                </span>
              ) : null}
              <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-[var(--color-text-secondary)]">
                {BUCKET_LABEL[album.weekBucket]}
              </span>
              <button
                type="button"
                onClick={() => removeAlbum(album.id)}
                disabled={processingIds.has(album.id)}
                className="shrink-0 rounded px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                {processingIds.has(album.id) ? "처리 중..." : "삭제"}
              </button>
            </li>
          ))}
        </ul>
      )}

      <ItunesAlbumPickerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onAlbumSelect={handleAlbumSelect}
        isSelecting={addSubmitting && modalOpen}
        selectError={addError}
        titleId="add-new-release-title"
        title="신보 추가"
        description="아티스트를 검색하면 오늘 이후 발매 앨범이 날짜와 함께 나옵니다."
        upcomingOnly
      />
      {manualModalOpen ? (
        <ManualAlbumFormModal
          open
          isSubmitting={addSubmitting}
          error={manualError}
          onClose={() => setManualModalOpen(false)}
          onSubmit={handleManualSubmit}
        />
      ) : null}
    </div>
  );
}
