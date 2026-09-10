"use client";
/** 관리자 — iTunes에 없는 발매 예정 앨범 직접 등록 */

import { useState, type FormEvent } from "react";
import { getKstTodayIso } from "@/src/lib/new-releases/weeks";

interface ManualAlbumFormModalProps {
  open: boolean;
  isSubmitting: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (input: {
    title: string;
    artist: string;
    releaseDate: string;
    imageUrl: string;
  }) => void;
}

export function ManualAlbumFormModal({
  open,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: ManualAlbumFormModalProps) {
  const today = getKstTodayIso();
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [releaseDate, setReleaseDate] = useState(today);
  const [imageUrl, setImageUrl] = useState("");

  if (!open) return null;

  function handleClose() {
    if (isSubmitting) return;
    onClose();
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit({ title, artist, releaseDate, imageUrl });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="text-lg font-semibold tracking-tight text-[var(--color-text-primary)]">
          직접 등록
        </h2>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          iTunes에 아직 없는 발매 예정 앨범을 홈 Upcoming Album Releases에만 올립니다.
          아티스트 앨범 목록에는 나가지 않고, 발매일이 지나면 자동 삭제됩니다.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-[var(--color-text-secondary)]">
              앨범 제목
            </label>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              maxLength={500}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-[var(--color-text-primary)]"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-[var(--color-text-secondary)]">
              아티스트
            </label>
            <input
              type="text"
              value={artist}
              onChange={(event) => setArtist(event.target.value)}
              required
              maxLength={255}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-[var(--color-text-primary)]"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-[var(--color-text-secondary)]">
              발매일
            </label>
            <input
              type="date"
              value={releaseDate}
              min={today}
              onChange={(event) => setReleaseDate(event.target.value)}
              required
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-[var(--color-text-primary)]"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-[var(--color-text-secondary)]">
              커버 이미지 URL
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
              placeholder="https://"
              maxLength={1000}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-[var(--color-text-primary)]"
            />
            <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
              비우면 커버 자리에 ORU 로고가 나갑니다.
            </p>
          </div>
          {error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : null}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="rounded-lg px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-zinc-100 disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              {isSubmitting ? "등록 중..." : "등록"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
