/** 공개 플레이리스트 상세 서버 진입 */

import type { Metadata } from "next";
import { cache } from "react";
import { getAppSession } from "@/src/lib/auth/session";
import { listComments } from "@/src/lib/comments/comment-service";
import { withDatabaseRead } from "@/src/lib/db";
import type { PlaylistDetailDto } from "@/src/lib/playlists/client-api";
import { getPlaylistDetail } from "@/src/lib/playlists/playlist-service";
import type { CommentPageData } from "@/src/components/interaction/CommentSection";
import { PublicPlaylistDetailClient } from "./public-playlist-detail-client";

const getInitialPlaylist = cache(async (id: string) => {
  const session = await getAppSession();
  return withDatabaseRead(async (dataSource) => {
    const [playlist, comments] = await Promise.all([
      getPlaylistDetail(dataSource, id, session?.user?.id ?? null),
      listComments(dataSource, {
        playlistId: id,
        viewerUserId: session?.user?.id ?? null,
        page: 1,
        pageSize: 10,
      }),
    ]);
    return JSON.parse(JSON.stringify({ playlist, comments })) as {
      playlist: PlaylistDetailDto;
      comments: CommentPageData;
    };
  });
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const canonical = `/playlist/${encodeURIComponent(id)}`;

  try {
    const { playlist } = await getInitialPlaylist(id);
    const description =
      playlist.description?.replace(/\s+/g, " ").trim().slice(0, 160) ||
      `${playlist.ownerNickname}님의 공개 플레이리스트`;
    return {
      title: playlist.title,
      description,
      alternates: { canonical },
      openGraph: {
        type: "website",
        url: canonical,
        title: playlist.title,
        description,
        images: playlist.coverImageUrl ? [playlist.coverImageUrl] : undefined,
      },
      robots: playlist.isPublic
        ? undefined
        : { index: false, follow: false },
    };
  } catch {
    return {
      title: "플레이리스트",
      alternates: { canonical },
      robots: { index: false, follow: false },
    };
  }
}

export default async function PublicPlaylistDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const initial = await getInitialPlaylist(id);

  return (
    <PublicPlaylistDetailClient
      playlistId={id}
      initialPlaylist={initial.playlist}
      initialComments={initial.comments}
    />
  );
}
