"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useRef, useEffect, useCallback } from "react";

interface ArtistSuggestion {
  artistId: number;
  artistName: string;
  artworkUrl100?: string;
  primaryGenreName?: string;
}

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

const DEBOUNCE_MS = 300;

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const isAdminView = searchParams.get("oru") === "open";
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<ArtistSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSuggestions = useCallback(async (term: string) => {
    if (!term.trim()) {
      setSuggestions([]);
      setIsDropdownOpen(false);
      return;
    }
    setIsLoadingSuggestions(true);
    setIsDropdownOpen(true);
    try {
      const res = await fetch(
        `/api/itunes/search-autocomplete?term=${encodeURIComponent(term.trim())}`
      );
      const data = await res.json().catch(() => null);
      if (data?.ok && Array.isArray(data?.results)) {
        setSuggestions(data.results);
        setIsDropdownOpen(data.results.length > 0);
      } else {
        setSuggestions([]);
        setIsDropdownOpen(false);
      }
    } catch {
      setSuggestions([]);
      setIsDropdownOpen(false);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, []);

  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setSuggestions([]);
      setIsDropdownOpen(false);
      return;
    }
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      fetchSuggestions(q);
    }, DEBOUNCE_MS);
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [searchQuery, fetchSuggestions]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    setIsDropdownOpen(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  function handleArtistSelect(artist: ArtistSuggestion) {
    setIsDropdownOpen(false);
    router.push(`/search?artistId=${artist.artistId}&artist=${encodeURIComponent(artist.artistName)}`);
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
      <main className="mx-auto w-[956px] max-w-full px-6 py-10 sm:px-10">
        <section className="bg-white pt-4 pb-8 sm:pt-6 sm:pb-12">
          <div className="space-y-3 text-center">
            <h1 className="text-[42px] font-semibold tracking-tight text-zinc-900">
              당신의 음악을 기록하고 <wbr />공유하세요
            </h1>
            <p className="mx-auto max-w-xl text-sm leading-6 text-zinc-600">
              좋아하는 앨범을 저장하고, 리뷰로 감상을 남기고, 새로운 음악을
              발견하세요.
            </p>
          </div>

          <form onSubmit={handleSearchSubmit} className="mt-10 flex justify-center">
            <div ref={searchContainerRef} className="relative w-[956px] max-w-full">
              <div
                className={`flex flex-col bg-white overflow-hidden transition-[border-radius,box-shadow] ${isDropdownOpen
                  ? "rounded-t-2xl rounded-b-none"
                  : "rounded-2xl border-2 border-black"
                  }`}
              >
                <div
                  className={`flex h-[68px] cursor-text items-center gap-3 ${isDropdownOpen ? "border-b-2 border-zinc-400 px-4" : "overflow-hidden px-3"
                    }`}
                >
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-full flex-1 cursor-text bg-transparent text-black caret-black pl-2 text-sm outline-none placeholder:text-zinc-400"
                    placeholder="아티스트 이름으로 검색해보세요"
                  />
                  <button
                    type="submit"
                    className="flex h-[54px] w-[65px] shrink-0 items-center justify-center rounded-xl bg-black text-white transition hover:bg-zinc-800"
                    aria-label="검색"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.35-4.35" />
                    </svg>
                  </button>
                </div>

                {isDropdownOpen && (
                  <ul role="listbox">
                    {isLoadingSuggestions ? (
                      <li className="px-4 py-3 text-sm text-zinc-500">검색 중...</li>
                    ) : (
                      suggestions.map((artist) => (
                        <li
                          key={artist.artistId}
                          role="option"
                          aria-selected="false"
                          className="border-b border-zinc-100 last:border-b-0"
                        >
                          <button
                            type="button"
                            onClick={() => handleArtistSelect(artist)}
                            className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-zinc-50"
                          >
                            <Image
                              src={
                                artist.artworkUrl100 ??
                                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect fill='%23e4e4e7' width='40' height='40'/%3E%3Cpath fill='%23a1a1aa' d='M20 18a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm0 2c-5 0-8 2.5-8 5v5h16v-5c0-2.5-3-5-8-5z'/%3E%3C/svg%3E"
                              }
                              alt={`${artist.artistName} 프로필`}
                              width={40}
                              height={40}
                              unoptimized
                              className="h-10 w-10 shrink-0 rounded-lg bg-zinc-200 object-cover"
                            />
                            <div className="min-w-0 flex-1 text-left">
                              <div className="truncate text-sm font-medium text-black">
                                {artist.artistName}
                              </div>
                              {artist.primaryGenreName && (
                                <div className="truncate text-xs text-zinc-400">
                                  {artist.primaryGenreName}
                                </div>
                              )}
                            </div>
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                )}
              </div>
            </div>
          </form>
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
