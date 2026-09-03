"use client";
/** 홈 Featured 앨범 슬라이드 섹션 */

import { useSession } from "next-auth/react";
import { useFeaturedAlbums } from "@/src/hooks/use-featured-albums";
import { useSlideSourceState } from "@/src/hooks/use-slide-source-state";
import { FeaturedAlbumCard } from "./featured-album-card";

export default function FeaturedAlbums() {
  const { data: session, status } = useSession();
  const { slideSource } = useSlideSourceState();
  const showAdminSlide = slideSource === "admin";
  const { albums, isLoading } = useFeaturedAlbums(
    status,
    session?.user?.id,
    showAdminSlide
  );

  if (isLoading) {
    return (
      <section className="mt-[var(--hero-subtitle-masterpiece-gap)]">
        <div className="flex items-center justify-center py-[var(--featured-track-padding-y)]">
          <div className="text-[length:var(--text-today-album-body-mobile)] text-[var(--color-text-secondary)]">
            앨범을 불러오는 중...
          </div>
        </div>
      </section>
    );
  }

  if (albums.length === 0) return null;

  return (
    <section className="relative left-1/2 mt-[var(--hero-subtitle-masterpiece-gap)] w-screen max-w-none -translate-x-1/2">
      <h2 className="mb-[calc(var(--masterpiece-slider-gap)-var(--masterpiece-slider-pad-y))] text-center text-[20px] font-semibold leading-[145%] tracking-[-0.005em] text-[var(--color-accent)]">
        Masterpiece
      </h2>
      <div className="relative overflow-hidden py-[var(--masterpiece-slider-pad-y)]">
        <div className="group flex flex-nowrap items-start animate-marquee-force">
          {albums.map((album) => (
            <FeaturedAlbumCard key={album.collectionId} album={album} />
          ))}
          <div className="flex flex-nowrap" aria-hidden>
            {albums.map((album) => (
              <FeaturedAlbumCard
                key={`marquee-clone-${album.collectionId}`}
                album={album}
                tabIndex={-1}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
