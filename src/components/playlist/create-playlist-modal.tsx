"use client";
/** 새 플레이리스트 생성 모달 */

import { useCallback, useEffect, useState } from "react";
import { getApiErrorMessage } from "@/src/lib/http/client";
import {
  PLAYLIST_COVER_CROP_OPTIONS,
  useImageCropFlow,
} from "@/src/hooks/use-image-crop-flow";
import { ProfilePrivacyToggle } from "@/src/components/profile/ProfilePrivacyToggle";
import {
  createPlaylistApi,
  uploadPlaylistCoverApi,
  type PlaylistListItemDto,
} from "@/src/lib/playlists/client-api";
import { GenreSelector } from "./genre-selector";
import { PlaylistCoverPicker } from "./playlist-cover-picker";

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (playlist: PlaylistListItemDto) => void;
}

export function CreatePlaylistModal({
  isOpen,
  onClose,
  onCreated,
}: CreatePlaylistModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [genreIds, setGenreIds] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCropped = useCallback((file: File) => {
    setCoverPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setCoverFile(file);
  }, []);

  const { openWithFile, clear: clearCrop, cropModalNode } = useImageCropFlow({
    ...PLAYLIST_COVER_CROP_OPTIONS,
    onCropped: handleCropped,
  });

  const resetForm = useCallback(() => {
    setTitle("");
    setDescription("");
    setGenreIds([]);
    setIsPublic(false);
    setCoverFile(null);
    setError(null);
    setIsSaving(false);
    clearCrop();
    setCoverPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }, [clearCrop]);

  useEffect(() => {
    if (!isOpen) return;
    resetForm();
  }, [isOpen, resetForm]);

  useEffect(() => {
    return () => {
      if (coverPreviewUrl) URL.revokeObjectURL(coverPreviewUrl);
    };
  }, [coverPreviewUrl]);

  async function handleCreate() {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("플레이리스트 제목을 입력해주세요.");
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      let coverImageUrl: string | null = null;
      if (coverFile) {
        const uploaded = await uploadPlaylistCoverApi(coverFile);
        coverImageUrl = uploaded.data.coverImageUrl;
      }

      const response = await createPlaylistApi({
        title: trimmedTitle,
        description: description.trim() || "",
        isPublic,
        coverImageUrl,
        genreIds,
      });
      onCreated(response.data.playlist);
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err, "플레이리스트 생성에 실패했습니다."));
    } finally {
      setIsSaving(false);
    }
  }

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        onClick={onClose}
      >
        <div
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-5 shadow-xl"
          onClick={(event) => event.stopPropagation()}
        >
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
            새 플레이리스트 생성
          </h3>
          <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
            제목과 대표사진을 설정한 뒤 생성할 수 있습니다.
          </p>

          <div className="mt-4 space-y-3">
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="플레이리스트 제목"
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
            />
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="설명 (선택)"
              rows={3}
              className="w-full resize-none rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500"
            />

            <div>
              <p className="mb-1.5 text-xs font-medium text-[var(--color-text-secondary)]">
                공개 설정
              </p>
              <ProfilePrivacyToggle
                isPublic={isPublic}
                disabled={isSaving}
                size="sm"
                onChange={setIsPublic}
              />
            </div>

            <div>
              <p className="mb-1.5 text-xs font-medium text-[var(--color-text-secondary)]">
                장르 (선택)
              </p>
              <GenreSelector
                value={genreIds}
                onChange={setGenreIds}
                disabled={isSaving}
              />
            </div>

            <div>
              <p className="mb-1.5 text-xs font-medium text-[var(--color-text-secondary)]">
                대표사진 (선택)
              </p>
              <PlaylistCoverPicker
                previewUrl={coverPreviewUrl}
                onPickFile={openWithFile}
                actions={
                  coverFile ? (
                    <button
                      type="button"
                      onClick={() => {
                        setCoverFile(null);
                        if (coverPreviewUrl) URL.revokeObjectURL(coverPreviewUrl);
                        setCoverPreviewUrl(null);
                      }}
                      className="rounded-full border border-zinc-200 px-3 py-1.5 text-[11px] text-[var(--color-text-secondary)] hover:bg-zinc-50"
                    >
                      선택 취소
                    </button>
                  ) : null
                }
              />
            </div>

            {error ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {error}
              </p>
            ) : null}
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-full border border-zinc-300 px-4 py-2 text-xs font-semibold text-[var(--color-text-primary)] hover:bg-zinc-50 disabled:opacity-60"
            >
              취소
            </button>
            <button
              type="button"
              onClick={() => void handleCreate()}
              disabled={isSaving}
              className="rounded-full bg-[var(--color-brand-primary)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--color-brand-primary-hover)] disabled:opacity-60"
            >
              {isSaving ? "처리 중..." : "생성하기"}
            </button>
          </div>
        </div>
      </div>

      {cropModalNode}
    </>
  );
}
