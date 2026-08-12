/** 내 즐겨찾기 앨범 페이지 */

import Image from "next/image";
import Link from "next/link";
import { ArtistNameLink } from "@/src/components/app/artist-name-link";
import { ProfileListPageLayout } from "@/src/components/profile/profile-list-page-layout";
import { requireAuthPage } from "@/src/lib/auth/session";
import { initializeDatabase } from "@/src/lib/db";
import { getUserFavoriteAlbums } from "@/src/lib/favorites/favorites-service";

export default async function FavoriteAlbumsPage() {
  const session = await requireAuthPage("/profile/albums");
  const dataSource = await initializeDatabase();
  const favorites = await getUserFavoriteAlbums(dataSource, session.user.id);

  return (
    <ProfileListPageLayout
      title="좋아하는 앨범 전체보기"
      description="내가 좋아요 표시한 모든 앨범 목록입니다."
      emptyMessage="아직 좋아하는 앨범이 없습니다."
      isEmpty={favorites.length === 0}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {favorites.map((fav) => (
          <Link
            key={fav.id}
            href={`/review/album/${encodeURIComponent(fav.albumId || (fav.album?.albumId ?? ""))}`}
            className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300 hover:shadow-md"
          >
            <div className="relative mb-3 aspect-square overflow-hidden rounded-xl bg-zinc-100">
              {fav.album?.imageUrl ? (
                <Image
                  src={fav.album.imageUrl}
                  alt={fav.album.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-[var(--color-text-muted)]">
                  이미지 없음
                </div>
              )}
            </div>
            <div className="min-h-[60px] space-y-1">
              <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
                {fav.album?.artist ? (
                  <ArtistNameLink
                    name={fav.album.artist}
                    className="max-w-full truncate text-left text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-secondary)] transition hover:text-[var(--color-brand-primary)] hover:underline disabled:cursor-wait disabled:no-underline"
                  />
                ) : null}
              </p>
              <h3 className="line-clamp-2 text-sm font-bold text-[var(--color-text-primary)]">
                {fav.album?.title}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </ProfileListPageLayout>
  );
}
