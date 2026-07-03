"use client";

import dynamic from "next/dynamic";
import { HomeHeroCopy } from "./components/home-hero-copy";
import { HomeHeroSticky } from "./components/home-hero-sticky";
import { ContentContainer } from "@/src/lib/layout/content-container";
import { PAGE_PADDING_X } from "@/src/lib/layout";

const FeaturedAlbums = dynamic(() => import("./components/FeaturedAlbums"), {
  loading: () => (
    <section className="mt-[var(--hero-subtitle-masterpiece-gap)]">
      <div className="flex items-center justify-center py-[var(--featured-track-padding-y)]">
        <div className="text-[length:var(--text-today-album-body-mobile)] text-[var(--color-text-secondary)]">
          앨범을 불러오는 중...
        </div>
      </div>
    </section>
  ),
});

const TodayAlbumCard = dynamic(() => import("./components/TodayAlbumCard"), {
  loading: () => null,
});

const MusicChart = dynamic(() => import("./components/MusicChart"), {
  loading: () => null,
});

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <ContentContainer className={`mx-auto w-full pb-8 sm:pb-10 ${PAGE_PADDING_X}`}>
        <HomeHeroSticky />
        <HomeHeroCopy className="mt-[var(--hero-search-copy-gap)]" />
        <FeaturedAlbums />
        <TodayAlbumCard />
        <MusicChart />
      </ContentContainer>
    </div>
  );
}
