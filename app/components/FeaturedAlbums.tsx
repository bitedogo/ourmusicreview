"use client";

import { useSession } from "next-auth/react";
import { useFeaturedAlbums } from "@/src/hooks/use-featured-albums";
import { useSlideSourceState } from "@/src/hooks/use-slide-source-state";
import { FeaturedAlbumCard } from "./featured-album-card";

export default function FeaturedAlbums() {
  const { data: session, status } = useSession();
  const { slideSource } = useSlideSourceState();
  const showAdminSlide = slideSource === "admin";
  const { albums, isLoading } = useFeaturedAlbums(status, session, showAdminSlide);

  if (isLoading) {
    return (
      <section className="mt-10">
        <div className="flex items-center justify-center py-12">
          <div className="text-sm text-zinc-500">앨범을 불러오는 중...</div>
        </div>
      </section>
    );
  }

  if (albums.length === 0) return null;

  const duplicatedAlbums = [...albums, ...albums];

  return (
    <section className="relative left-1/2 mt-[6px] w-screen max-w-none -translate-x-1/2">
      <div className="relative overflow-hidden py-4">
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
