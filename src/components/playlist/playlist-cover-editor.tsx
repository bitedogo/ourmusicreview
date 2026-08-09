"use client";
/** 플레이리스트 대표사진 변경 패널 */

import { useCallback, useEffect, useState } from "react";
import {
  PLAYLIST_COVER_CROP_OPTIONS,
  useImageCropFlow,
} from "@/src/hooks/use-image-crop-flow";
import { PlaylistCoverPicker } from "@/src/components/playlist/playlist-cover-picker";

interface PlaylistCoverEditorProps {
  currentCoverUrl: string | null;
  isSaving: boolean;
  onClose: () => void;
  onSave: (file: File) => Promise<boolean>;
  onClear: () => Promise<boolean>;
}

export function PlaylistCoverEditor({
  currentCoverUrl,
  isSaving,
  onClose,
  onSave,
  onClear,
}: PlaylistCoverEditorProps) {
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);

  const handleCropped = useCallback((file: File) => {
    setCoverPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setCoverFile(file);
  }, []);

  const { openWithFile, cropModalNode } = useImageCropFlow({
    ...PLAYLIST_COVER_CROP_OPTIONS,
    onCropped: handleCropped,
  });

  useEffect(() => {
    return () => {
      if (coverPreviewUrl) URL.revokeObjectURL(coverPreviewUrl);
    };
  }, [coverPreviewUrl]);

  function resetLocalCover() {
    setCoverFile(null);
    setCoverPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }

  async function handleSave() {
    if (!coverFile) {
      alert("변경할 이미지를 선택해주세요.");
      return;
    }
    const ok = await onSave(coverFile);
    if (ok) {
      resetLocalCover();
      onClose();
    }
  }

  async function handleClear() {
    const ok = await onClear();
    if (ok) {
      resetLocalCover();
      onClose();
    }
  }

  return (
    <>
      <div className="mt-4 space-y-2 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
        <p className="text-xs font-medium text-[var(--color-text-secondary)]">
          대표사진 변경
        </p>
        <PlaylistCoverPicker
          previewUrl={coverPreviewUrl}
          fallbackUrl={currentCoverUrl}
          size="sm"
          onPickFile={openWithFile}
          actions={
            <>
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={isSaving || !coverFile}
                className="rounded-full bg-[var(--color-brand-primary)] px-3 py-1 text-[11px] font-semibold text-white disabled:opacity-60"
              >
                저장
              </button>
              {currentCoverUrl ? (
                <button
                  type="button"
                  onClick={() => void handleClear()}
                  disabled={isSaving}
                  className="rounded-full border border-red-200 bg-white px-3 py-1 text-[11px] text-red-600"
                >
                  대표사진 삭제
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  resetLocalCover();
                  onClose();
                }}
                className="rounded-full border border-zinc-300 bg-white px-3 py-1 text-[11px] text-[var(--color-text-primary)]"
              >
                취소
              </button>
            </>
          }
        />
      </div>
      {cropModalNode}
    </>
  );
}
