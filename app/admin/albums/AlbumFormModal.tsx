"use client";
/** 관리자 오늘의 앨범 관리 - 등록/수정 모달 */

import Image from "next/image";
import { ItunesAlbumSearchPanel } from "@/src/components/itunes/itunes-album-search-panel";
import type { ItunesAlbumPickerState } from "@/src/hooks/use-itunes-album-picker";
import type { SearchAlbumResult } from "@/src/lib/search/types";
import type { TodayAlbumFormState } from "./types";

interface AlbumFormModalProps {
  form: TodayAlbumFormState;
  onFormChange: (updater: (f: TodayAlbumFormState) => TodayAlbumFormState) => void;
  editingDate: string | null;
  takenDates: string[];
  albumPicker: ItunesAlbumPickerState;
  onAlbumSelect: (album: SearchAlbumResult) => void;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function AlbumFormModal({
  form,
  onFormChange,
  editingDate,
  takenDates,
  albumPicker,
  onAlbumSelect,
  isSubmitting,
  onClose,
  onSubmit,
}: AlbumFormModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold tracking-tight text-[var(--color-text-primary)]">
          {editingDate ? "오늘의 앨범 수정" : "오늘의 앨범 등록"}
        </h2>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <ItunesAlbumSearchPanel
            picker={albumPicker}
            onAlbumSelect={onAlbumSelect}
            variant="embedded"
          />
          <div>
            <label className="mb-1 block text-xs font-semibold text-[var(--color-text-secondary)]">
              노출 날짜
            </label>
            <input
              type="date"
              value={form.displayDate}
              onChange={(e) =>
                onFormChange((f) => ({ ...f, displayDate: e.target.value }))
              }
              required
              disabled={!!editingDate}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-[var(--color-text-primary)] disabled:bg-zinc-100 disabled:text-[var(--color-text-secondary)]"
            />
            {!editingDate && takenDates.includes(form.displayDate) && (
              <p className="mt-1 text-xs text-amber-600">
                이 날짜에 이미 등록된 앨범이 있습니다. 저장 시 덮어쓰기됩니다.
              </p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-[var(--color-text-secondary)]">
              제목
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) =>
                onFormChange((f) => ({ ...f, title: e.target.value }))
              }
              required
              placeholder="앨범 제목"
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)] focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-[var(--color-text-secondary)]">
              아티스트
            </label>
            <input
              type="text"
              value={form.artist}
              onChange={(e) =>
                onFormChange((f) => ({ ...f, artist: e.target.value }))
              }
              required
              placeholder="아티스트명"
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)] focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
            />
          </div>
          {form.imageUrl && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-[var(--color-text-secondary)]">
                앨범 커버
              </label>
              <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
                <Image
                  src={form.imageUrl}
                  alt={form.title || "앨범 커버"}
                  width={64}
                  height={64}
                  unoptimized
                  className="h-16 w-16 shrink-0 rounded object-cover"
                />
                <p className="text-xs text-[var(--color-text-secondary)]">
                  선택된 앨범의 커버 이미지입니다.
                </p>
              </div>
            </div>
          )}
          <div>
            <label className="mb-1 block text-xs font-semibold text-[var(--color-text-secondary)]">
              추천평
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                onFormChange((f) => ({ ...f, description: e.target.value }))
              }
              rows={4}
              placeholder="관리자 추천 한마디"
              className="w-full resize-none rounded-lg border border-zinc-200 px-3 py-2 text-sm text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-muted)] focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-[var(--color-text-primary)] hover:bg-zinc-50"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg border border-zinc-900 bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "처리 중..." : "저장"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
