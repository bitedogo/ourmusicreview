"use client";
/** 플레이리스트 상세 헤더(커버·메타·장르·액션) */

import Image from "next/image";
import { useEffect, useState } from "react";
import type { PlaylistDetailDto } from "@/src/components/playlist/playlist-api";
import { GenreSelector } from "@/src/components/playlist/genre-selector";
import { GenreTags } from "@/src/components/playlist/genre-tags";

const actionButtonClass =
  "rounded-full border border-zinc-300 px-3 py-1 text-[11px] text-zinc-700 hover:bg-zinc-50 disabled:opacity-60";

interface PlaylistDetailHeaderProps {
  playlist: PlaylistDetailDto;
  isSaving: boolean;
  onToggleCoverEditor: () => void;
  onDelete: () => void;
  onSaveGenres?: (genreIds: string[]) => Promise<boolean>;
  coverEditor: React.ReactNode;
}

export function PlaylistDetailHeader({
  playlist,
  isSaving,
  onToggleCoverEditor,
  onDelete,
  onSaveGenres,
  coverEditor,
}: PlaylistDetailHeaderProps) {
  const [isGenreEditorOpen, setIsGenreEditorOpen] = useState(false);
  const [draftGenreIds, setDraftGenreIds] = useState<string[]>(
    () => playlist.genres?.map((g) => g.id) ?? []
  );

  useEffect(() => {
    setDraftGenreIds(playlist.genres?.map((g) => g.id) ?? []);
  }, [playlist.genres]);

  async function handleSaveGenres() {
    if (!onSaveGenres) return;
    const ok = await onSaveGenres(draftGenreIds);
    if (ok) setIsGenreEditorOpen(false);
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-stretch gap-4">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-zinc-100 sm:h-28 sm:w-28">
          {playlist.coverImageUrl ? (
            <Image
              src={playlist.coverImageUrl}
              alt={playlist.title}
              fill
              unoptimized
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">
              No Cover
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-xl font-semibold tracking-tight text-zinc-900">
                {playlist.title}
              </h1>
              <p className="mt-1 text-xs text-zinc-500">
                {playlist.trackCount}곡 · {playlist.isPublic ? "공개" : "비공개"}
              </p>
              {playlist.description ? (
                <p className="mt-2 text-sm text-zinc-600">{playlist.description}</p>
              ) : null}
              {!isGenreEditorOpen ? (
                <GenreTags
                  genres={playlist.genres ?? []}
                  className="mt-2"
                  size="md"
                />
              ) : null}
            </div>

            <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center">
              {onSaveGenres ? (
                <button
                  type="button"
                  onClick={() => {
                    setDraftGenreIds(playlist.genres?.map((g) => g.id) ?? []);
                    setIsGenreEditorOpen((prev) => !prev);
                  }}
                  disabled={isSaving}
                  className={actionButtonClass}
                >
                  장르 수정
                </button>
              ) : null}
              <button
                type="button"
                onClick={onToggleCoverEditor}
                disabled={isSaving}
                className={actionButtonClass}
              >
                대표사진 변경
              </button>
            </div>
          </div>

          <div className="mt-auto flex justify-end pt-3">
            <button
              type="button"
              onClick={onDelete}
              disabled={isSaving}
              className="rounded-full border border-red-200 px-3 py-1 text-[11px] text-red-600 hover:bg-red-50 disabled:opacity-60"
            >
              삭제
            </button>
          </div>
        </div>
      </div>

      {isGenreEditorOpen && onSaveGenres ? (
        <div className="mt-4 border-t border-zinc-100 pt-4">
          <GenreSelector
            value={draftGenreIds}
            onChange={setDraftGenreIds}
            disabled={isSaving}
          />
          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsGenreEditorOpen(false)}
              disabled={isSaving}
              className={actionButtonClass}
            >
              취소
            </button>
            <button
              type="button"
              onClick={() => void handleSaveGenres()}
              disabled={isSaving}
              className="rounded-full bg-[var(--color-brand-primary)] px-3 py-1 text-[11px] font-semibold text-white hover:bg-[var(--color-brand-primary-hover)] disabled:opacity-60"
            >
              {isSaving ? "저장 중..." : "장르 저장"}
            </button>
          </div>
        </div>
      ) : null}

      {coverEditor}
    </section>
  );
}
