"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { HomeHeroSearch } from "./components/home-hero-search";
import { ContentContainer } from "@/src/lib/layout/content-container";
import { PAGE_PADDING_X } from "@/src/lib/layout/constants";

const FeaturedAlbums = dynamic(() => import("./components/FeaturedAlbums"), {
  loading: () => (
    <section className="mt-10 flex justify-center py-12">
      <span className="text-sm text-zinc-500">앨범을 불러오는 중...</span>
    </section>
  ),
});

const TodayAlbumCard = dynamic(() => import("./components/TodayAlbumCard"), {
  loading: () => null,
});

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white">
          <div className="text-sm text-zinc-500">로딩 중...</div>
        </div>
      }
    >
      <div className="min-h-screen bg-white text-zinc-900">
        <ContentContainer className={`mx-auto w-full pb-8 sm:pb-10 ${PAGE_PADDING_X}`}>
          <HomeHeroSearch />
          <FeaturedAlbums />
          <TodayAlbumCard />
        </ContentContainer>
      </div>
    </Suspense>
  );
}
