"use client";

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
      <section className="mt-[var(--today-album-section-margin-top)]">
        <div className="flex items-center justify-center py-[var(--featured-track-padding-y)]">
          <div className="text-[length:var(--text-today-album-body-mobile)] text-[var(--color-text-secondary)]">
            앨범을 불러오는 중...
          </div>
        </div>
      </section>
    );
  }

  if (albums.length === 0) return null;

  const duplicatedAlbums = [...albums, ...albums];

  return (
    <section className="relative left-1/2 mt-[var(--featured-track-margin-top)] w-screen max-w-none -translate-x-1/2">
      <h2 className="text-center text-xl font-medium text-[var(--color-accent)]">
        Recent Rate
      </h2>
      <div className="relative overflow-hidden py-[var(--featured-track-padding-y)]">
        <div className="group flex flex-nowrap items-start animate-marquee-force">
          {duplicatedAlbums.map((album, index) => (
            <FeaturedAlbumCard
              key={`${album.collectionId}-${index}`}
              album={album}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
