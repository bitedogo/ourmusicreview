"use client";
/** 플레이리스트 상세 헤더(커버·메타·액션) */

import Image from "next/image";
import type { PlaylistDetailDto } from "@/src/components/playlist/playlist-api";

const actionButtonClass =
  "rounded-full border border-zinc-300 px-3 py-1 text-[11px] text-zinc-700 hover:bg-zinc-50 disabled:opacity-60";

interface PlaylistDetailHeaderProps {
  playlist: PlaylistDetailDto;
  isSaving: boolean;
  onToggleCoverEditor: () => void;
  onDelete: () => void;
  coverEditor: React.ReactNode;
}

export function PlaylistDetailHeader({
  playlist,
  isSaving,
  onToggleCoverEditor,
  onDelete,
  coverEditor,
}: PlaylistDetailHeaderProps) {
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
            </div>

            <div className="flex shrink-0 items-center gap-2">
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

      {coverEditor}
    </section>
  );
}
