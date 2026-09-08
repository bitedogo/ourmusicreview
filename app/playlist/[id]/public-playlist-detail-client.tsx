"use client";
/** 공개 플레이리스트 상세의 상호작용 경계 */

import {
  CommentSection,
  type CommentPageData,
} from "@/src/components/interaction/CommentSection";
import { InteractionButtons } from "@/src/components/interaction/InteractionButtons";
import { PlaylistDetailHeader } from "@/src/components/playlist/playlist-detail-header";
import { PlaylistDetailShell } from "@/src/components/playlist/playlist-detail-shell";
import { PlaylistTrackList } from "@/src/components/playlist/playlist-track-list";
import { getUserProfilePath } from "@/src/components/profile/profile-view-types";
import { usePlaylistDetailQuery } from "@/src/hooks/use-playlist-detail-query";
import type { PlaylistDetailDto } from "@/src/lib/playlists/client-api";
import { playlistList } from "@/src/lib/navigation/routes";

export function PublicPlaylistDetailClient({
  playlistId,
  initialPlaylist,
  initialComments,
}: {
  playlistId: string;
  initialPlaylist: PlaylistDetailDto;
  initialComments: CommentPageData;
}) {
  const { playlist, isLoading, error, streamingLinksByTrackId } =
    usePlaylistDetailQuery(playlistId, initialPlaylist);

  return (
    <PlaylistDetailShell
      backHref={playlistList()}
      isLoading={isLoading}
      error={error}
      hasPlaylist={!!playlist}
      className="mx-auto flex min-h-screen w-full max-w-[640px] flex-col px-4 py-10 sm:px-0"
    >
      {playlist ? (
        <>
          <div className="flex flex-col gap-6">
            <PlaylistDetailHeader
              playlist={playlist}
              variant="readonly"
              ownerHref={getUserProfilePath(playlist.userId)}
            />

            <PlaylistTrackList
              tracks={playlist.tracks}
              streamingLinksByTrackId={streamingLinksByTrackId}
            />
          </div>

          <div className="pt-4 pb-[30px] sm:pt-[18px] sm:pb-[30px]">
            <InteractionButtons
              playlistId={playlist.id}
              authorUserId={playlist.userId}
              variant="circle"
            />
          </div>

          <CommentSection
            playlistId={playlist.id}
            variant="detail"
            initialData={initialComments}
          />
        </>
      ) : null}
    </PlaylistDetailShell>
  );
}
