/** 홈: 히어로·오늘의 앨범·신보·차트·Featured (RSC 셸) */

import dynamicImport from "next/dynamic";
import { HomeHeroCopy } from "@/src/components/app/home-hero-copy";
import { HomeHeroSticky } from "@/src/components/app/home-hero-sticky";
import { getMusicChart } from "@/src/lib/chart/fetch-chart";
import { withDatabaseRead } from "@/src/lib/db";
import { getFeaturedAlbums } from "@/src/lib/featured-albums/featured-album-service";
import { ContentContainer } from "@/src/lib/layout/content-container";
import { PAGE_PADDING_X } from "@/src/lib/layout";
import { getTodayAlbums } from "@/src/lib/today-album/today-album-service";
import type { TodayAlbumsResponse } from "@/src/lib/today-album/types";
import {
  emptyNewReleasesHomeData,
  getHomeNewReleases,
} from "@/src/lib/new-releases/new-release-service";

export const dynamic = "force-dynamic";

const FeaturedAlbums = dynamicImport(() => import("@/src/components/app/FeaturedAlbums"), {
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

const TodayAlbumCard = dynamicImport(() => import("@/src/components/app/TodayAlbumCard"), {
  loading: () => null,
});

const MusicChart = dynamicImport(() => import("@/src/components/app/MusicChart"), {
  loading: () => null,
});

const NewReleases = dynamicImport(() => import("@/src/components/app/NewReleases"), {
  loading: () => null,
});

const EMPTY_TODAY_ALBUMS: TodayAlbumsResponse = {
  ok: true,
  albums: { today: null, yesterday: null, previous: null },
  archive: [],
};

export default async function Home() {
  const [featured, todayAlbums, newReleases, chartAlbums] = await Promise.all([
    withDatabaseRead((dataSource) => getFeaturedAlbums(dataSource)).catch(() => ({
      albums: [],
      hasUserSlide: false,
    })),
    withDatabaseRead(getTodayAlbums).catch(() => EMPTY_TODAY_ALBUMS),
    withDatabaseRead(getHomeNewReleases).catch(() => emptyNewReleasesHomeData()),
    getMusicChart("kr").catch(() => []),
  ]);

  return (
    <div className="min-h-screen bg-white text-[var(--color-text-primary)]">
      <ContentContainer className={`mx-auto w-full pb-8 sm:pb-10 ${PAGE_PADDING_X}`}>
        <HomeHeroSticky />
        <HomeHeroCopy className="mt-[var(--hero-search-copy-gap)]" />
        <FeaturedAlbums initialAlbums={featured.albums} />
        <TodayAlbumCard initialData={todayAlbums} />
        <NewReleases initialData={newReleases} />
        <MusicChart initialAlbums={chartAlbums} />
      </ContentContainer>
    </div>
  );
}
