"use client";
/** iTunes 앨범 선택 모달 */

import { useEffect } from "react";
import type { SearchAlbumResult } from "@/src/lib/search/types";
import { useItunesAlbumPicker } from "@/src/hooks/use-itunes-album-picker";
import { ItunesAlbumSearchPanel } from "@/src/components/itunes/itunes-album-search-panel";

interface ItunesAlbumPickerModalProps {
  open: boolean;
  onClose: () => void;
  onAlbumSelect: (album: SearchAlbumResult) => void | Promise<void>;
  title?: string;
  description?: string;
  isSelecting?: boolean;
  selectError?: string | null;
  titleId?: string;
}

export function ItunesAlbumPickerModal({
  open,
  onClose,
  onAlbumSelect,
  title = "앨범 추가",
  description = "아티스트 검색 후 앨범을 선택하세요.",
  isSelecting = false,
  selectError = null,
  titleId = "itunes-album-picker-title",
}: ItunesAlbumPickerModalProps) {
  const picker = useItunesAlbumPicker();
  const { reset } = picker;

  useEffect(() => {
    if (open) {
      reset();
    }
  }, [open, reset]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <h2 id={titleId} className="text-lg font-bold text-zinc-900">
          {title}
        </h2>
        <p className="mt-1 text-sm text-zinc-500">{description}</p>

        <ItunesAlbumSearchPanel
          picker={picker}
          onAlbumSelect={onAlbumSelect}
          isSelecting={isSelecting}
          error={selectError}
          variant="modal"
        />

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[var(--color-brand-primary)] px-4 py-2 text-sm font-medium text-[var(--color-brand-primary)] hover:bg-[#F7FCFD]"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
