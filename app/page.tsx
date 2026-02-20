"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";

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

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  useSession();

  const isAdminView = searchParams.get("admin") === "true";
  const [searchQuery, setSearchQuery] = useState("");

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  if (!isAdminView) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white px-6">
        <div className="flex max-w-md flex-col items-center gap-6 text-center">
          <Image
            src="/oru-num6.png"
            alt="ORU 로고"
            width={72}
            height={72}
            className="h-10 w-auto"
            priority
          />
          <p className="text-base sm:text-lg font-medium tracking-tight text-zinc-900">
            현재 점검 중입니다. 곧 정식 출시됩니다!
          </p>
          <p className="text-xs sm:text-sm text-zinc-500">
            서비스 안정화를 위해 잠시 문을 닫았습니다. 조금만 기다려 주세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <main className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-10">
        <section className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-gradient-to-b from-zinc-50 to-white shadow-lg">
          <div className="absolute inset-0 opacity-40">
            <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-purple-100 blur-3xl" />
            <div className="absolute -bottom-28 -right-24 h-64 w-64 rounded-full bg-emerald-100 blur-3xl" />
          </div>

          <div className="relative p-8 sm:p-12">
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
                당신의 음악을 기록하고 공유하세요
              </h1>
              <p className="max-w-xl text-sm leading-6 text-zinc-600">
                좋아하는 앨범을 저장하고, 리뷰로 감상을 남기고, 새로운 음악을
                발견하세요.
              </p>
            </div>

            <form
              onSubmit={handleSearchSubmit}
              className="mt-7 flex flex-col gap-3 sm:flex-row"
            >
              <div className="relative flex-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-400">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M10.5 18.5C14.9183 18.5 18.5 14.9183 18.5 10.5C18.5 6.08172 14.9183 2.5 10.5 2.5C6.08172 2.5 2.5 6.08172 2.5 10.5C2.5 14.9183 6.08172 18.5 10.5 18.5Z"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M21.5 21.5L17.2 17.2"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-2xl border border-zinc-200 bg-white px-11 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200"
                  placeholder="아티스트 이름으로 검색해보세요"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-2xl border border-zinc-200 bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-black"
              >
                검색
              </button>
            </form>
          </div>
        </section>

        <FeaturedAlbums />

        <TodayAlbumCard />
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-sm text-zinc-500">로딩 중...</div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
