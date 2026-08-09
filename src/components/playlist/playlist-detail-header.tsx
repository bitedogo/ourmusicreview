"use client";
/** 플레이리스트 상세 헤더(커버·메타·장르·액션) */

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import type { PlaylistDetailDto } from "@/src/lib/playlists/client-api";
import { GenreSelector } from "@/src/components/playlist/genre-selector";
import { GenreTags } from "@/src/components/playlist/genre-tags";
import { PlaylistEngagementCounts } from "@/src/components/playlist/playlist-engagement-counts";
import { PlaylistVinylCover } from "@/src/components/playlist/playlist-vinyl-cover";
import { ProfilePrivacyToggle } from "@/src/components/profile/ProfilePrivacyToggle";

const actionButtonClass =
  "rounded-full border border-zinc-300 px-3 py-1 text-[11px] text-[var(--color-text-primary)] hover:bg-zinc-50 disabled:opacity-60";

interface PlaylistDetailHeaderProps {
  playlist: PlaylistDetailDto;
  variant?: "readonly" | "editable";
  ownerHref?: string;
  isSaving?: boolean;
  onToggleCoverEditor?: () => void;
  onDelete?: () => void;
  onSaveGenres?: (genreIds: string[]) => Promise<boolean>;
  onSavePublic?: (isPublic: boolean) => Promise<boolean>;
  coverEditor?: ReactNode;
}

export function PlaylistDetailHeader({
  playlist,
  variant = "editable",
  ownerHref,
  isSaving = false,
  onToggleCoverEditor,
  onDelete,
  onSaveGenres,
  onSavePublic,
  coverEditor,
}: PlaylistDetailHeaderProps) {
  const isEditable = variant === "editable";
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

  const ownerLabel = playlist.ownerNickname || playlist.userId;

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-stretch gap-4">
        <PlaylistVinylCover
          coverImageUrl={playlist.coverImageUrl}
          alt={playlist.title}
          size="md"
          interactive
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-xl font-semibold tracking-tight text-[var(--color-text-primary)]">
                {playlist.title}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <p className="text-xs text-[var(--color-text-secondary)]">
                  {playlist.trackCount}곡
                  {!isEditable && ownerHref ? (
                    <>
                      {" · "}
                      <Link
                        href={ownerHref}
                        className="hover:text-[var(--color-brand-primary)] hover:underline"
                      >
                        {ownerLabel}
                      </Link>
                    </>
                  ) : null}
                </p>
                {isEditable ? (
                  onSavePublic ? (
                    <ProfilePrivacyToggle
                      isPublic={playlist.isPublic}
                      disabled={isSaving}
                      size="sm"
                      onChange={(value) => void onSavePublic(value)}
                    />
                  ) : (
                    <p className="text-xs text-[var(--color-text-secondary)]">
                      · {playlist.isPublic ? "공개" : "비공개"}
                    </p>
                  )
                ) : null}
              </div>
              {isEditable ? (
                <PlaylistEngagementCounts
                  likeCount={playlist.likeCount ?? 0}
                  commentCount={playlist.commentCount ?? 0}
                  className="mt-1.5"
                  size="desktop"
                />
              ) : null}
              {playlist.description ? (
                <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                  {playlist.description}
                </p>
              ) : null}
              {!isGenreEditorOpen ? (
                <GenreTags
                  genres={playlist.genres ?? []}
                  className="mt-2"
                  size="md"
                />
              ) : null}
            </div>

            {isEditable ? (
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
                {onToggleCoverEditor ? (
                  <button
                    type="button"
                    onClick={onToggleCoverEditor}
                    disabled={isSaving}
                    className={actionButtonClass}
                  >
                    대표사진 변경
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>

          {isEditable && onDelete ? (
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
          ) : null}
        </div>
      </div>

      {isEditable && isGenreEditorOpen && onSaveGenres ? (
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

      {isEditable ? coverEditor : null}
    </section>
  );
}
