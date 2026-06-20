"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { HomeHeroSearch } from "./components/home-hero-search";
import { HOME_CONTENT_MAX_WIDTH } from "@/src/lib/layout/constants";

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
        <main
          className="mx-auto w-full px-6 py-8 sm:px-10 sm:py-10"
          style={{ maxWidth: HOME_CONTENT_MAX_WIDTH }}
        >
          <HomeHeroSearch />
          <FeaturedAlbums />
          <TodayAlbumCard />
        </main>
      </div>
    </Suspense>
  );
}
