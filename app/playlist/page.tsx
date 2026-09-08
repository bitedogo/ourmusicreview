/** 공개 플레이리스트 목록 페이지 */

import { Suspense } from "react";
import { withDatabaseRead } from "@/src/lib/db";
import { getGenreTree } from "@/src/lib/genres/genre-service";
import type { PublicPlaylistInitialData } from "@/src/hooks/use-public-playlist-list";
import { listPublicPlaylists } from "@/src/lib/playlists/playlist-service";
import { PlaylistListClient } from "./PlaylistListClient";

type PlaylistSearchParams = Promise<
  Record<string, string | string[] | undefined>
>;

function first(value: string | string[] | undefined): string | null {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

export default async function PlaylistPage({
  searchParams,
}: {
  searchParams: PlaylistSearchParams;
}) {
  const query = await searchParams;
  const initialData = await withDatabaseRead(async (dataSource) => {
    const [result, featuredResult, genreTree] = await Promise.all([
      listPublicPlaylists(dataSource, {
        page: first(query.page),
        searchField: first(query.searchField),
        q: first(query.q),
        genre: first(query.genre),
      }),
      listPublicPlaylists(dataSource, {
        page: "1",
        searchField: null,
        q: null,
        genre: null,
      }),
      getGenreTree(dataSource),
    ]);

    return JSON.parse(
      JSON.stringify({
        playlists: result.playlists,
        featured: featuredResult.playlists.slice(0, 5),
        genreTree,
        page: result.page,
        totalPages: result.totalPages,
        searchField: result.searchField,
        q: result.q,
        genre: result.genre ?? "",
      })
    ) as PublicPlaylistInitialData;
  });

  return (
    <Suspense
      fallback={
        <div className="mx-auto flex min-h-screen w-full max-w-[860px] flex-col bg-white px-4 pb-14 pt-[72px] sm:px-6">
          <h1 className="text-[28px] font-semibold tracking-tight text-[var(--color-text-primary)]">
            플레이리스트
          </h1>
          <div className="mt-6 flex min-h-[168px] items-center justify-center rounded-[28px] bg-gradient-to-br from-[#C45C2A] to-[#7A2E12] text-sm text-white/80 sm:min-h-[200px]">
            불러오는 중...
          </div>
        </div>
      }
    >
      <PlaylistListClient initialData={initialData} />
    </Suspense>
  );
}
