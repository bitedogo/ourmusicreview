"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { fetchJson } from "@/src/lib/http/client";
import { MyPicksSection } from "./my-picks-section";

interface ProfileClientProps {
  id: string;
  nickname: string;
    name: string | null;
  gender: "MALE" | "FEMALE" | "NONE" | null;
  role: "USER" | "ADMIN";
  createdAtText: string;
  profileImage: string | null;
}

interface MyReview {
  id: string;
  content: string;
  rating: number;
  isApproved: "Y" | "N";
  rejectReason: string | null;
  albumId: string;
  createdAt: string;
  updatedAt: string;
  album: {
    albumId: string;
    title: string;
    artist: string;
    imageUrl: string | null;
  } | null;
}

interface FavoriteAlbum {
  id: string;
  albumId: string;
  createdAt: string;
  album: {
    albumId: string;
    title: string;
    artist: string;
    imageUrl: string | null;
    releaseDate: string | null;
  } | null;
}

interface MyReviewsResponse {
  ok: boolean;
  data: {
    reviews: MyReview[];
  };
}

interface FavoriteAlbumsResponse {
  ok: boolean;
  data: {
    favorites: FavoriteAlbum[];
  };
}

const GENDER_LABEL: Record<string, string> = {
  MALE: "남성",
  FEMALE: "여성",
  NONE: "-",
};

export function ProfileClient({
  id,
  nickname,
  name,
  gender,
  role,
  createdAtText,
  profileImage,
}: ProfileClientProps) {
  const [myReviews, setMyReviews] = useState<MyReview[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [favoriteAlbums, setFavoriteAlbums] = useState<FavoriteAlbum[]>([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  async function handleDeleteAccount() {
    if (!confirm("정말로 계정을 삭제하시겠습니까?\n\n삭제된 계정은 복구할 수 없으며, 작성한 리뷰·댓글 등 모든 데이터가 삭제됩니다.")) {
      return;
    }
    if (!confirm("한 번 더 확인합니다. 계정을 삭제하시겠습니까?")) {
      return;
    }

    setIsDeletingAccount(true);
    try {
      const response = await fetch("/api/user/account", { method: "DELETE" });
      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.ok) {
        alert(data?.error ?? "계정 삭제에 실패했습니다.");
        return;
      }

      await signOut({ callbackUrl: "/" });
    } catch {
      alert("계정 삭제 중 오류가 발생했습니다.");
    } finally {
      setIsDeletingAccount(false);
    }
  }

  async function fetchMyReviews() {
    try {
      setIsLoadingReviews(true);
      const data = await fetchJson<MyReviewsResponse>("/api/reviews");
      setMyReviews(data.data.reviews || []);
    } catch {
      setMyReviews([]);
    } finally {
      setIsLoadingReviews(false);
    }
  }

  async function fetchFavorites() {
    try {
      setIsLoadingFavorites(true);
      const data = await fetchJson<FavoriteAlbumsResponse>("/api/favorites");
      setFavoriteAlbums(data.data.favorites || []);
    } catch {
      setFavoriteAlbums([]);
    } finally {
      setIsLoadingFavorites(false);
    }
  }

  useEffect(() => {
    fetchMyReviews();
    fetchFavorites();
  }, []);

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        fetchMyReviews();
        fetchFavorites();
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-5xl px-3 py-6 sm:px-6 sm:py-8 md:px-10">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900 md:text-2xl">
            마이페이지
          </h1>
          {role !== "ADMIN" && (
            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={isDeletingAccount}
              className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
            >
              {isDeletingAccount ? "처리 중..." : "계정삭제"}
            </button>
          )}
        </div>

        <div className="mb-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="flex flex-col md:flex-row">
            <div className="flex flex-1 flex-col items-center gap-4 border-b border-zinc-100 p-6 md:min-w-0 md:border-b-0 md:border-r md:border-zinc-100">
              <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full border-2 border-zinc-100 bg-zinc-100 shadow-sm md:h-28 md:w-28">
                {profileImage ? (
                  <Image
                    src={profileImage}
                    alt={nickname}
                    width={112}
                    height={112}
                    unoptimized
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs font-bold uppercase text-zinc-400">
                    No Image
                  </div>
                )}
              </div>
              <div className="text-center">
                <p className="text-base font-bold text-zinc-900 md:text-lg">{nickname}</p>
                <p className="mt-0.5 truncate text-xs text-zinc-500">{id}</p>
              </div>

              <div className="grid w-full grid-cols-2 gap-3">
                <div className="rounded-lg bg-zinc-50 px-3 py-2 text-center">
                  <p className="text-lg font-bold text-zinc-900">{myReviews.length}</p>
                  <p className="text-[10px] font-medium text-zinc-500">리뷰</p>
                </div>
                <div className="rounded-lg bg-zinc-50 px-3 py-2 text-center">
                  <p className="text-lg font-bold text-zinc-900">{favoriteAlbums.length}</p>
                  <p className="text-[10px] font-medium text-zinc-500">좋아요</p>
                </div>
              </div>
              <Link
                href="/profile/edit"
                className="w-full rounded-lg bg-[var(--color-brand-primary)] px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-[var(--color-brand-primary-hover)]"
              >
                내 정보 수정
              </Link>
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-6 border-b border-zinc-100 p-6 md:border-b-0 md:border-r md:border-zinc-100">
              <div className="grid grid-cols-2 gap-x-10 gap-y-6 sm:grid-cols-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">이름</p>
                  <p className="mt-1.5 truncate text-sm font-medium text-zinc-900">{name ?? "-"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">성별</p>
                  <p className="mt-1.5 text-sm font-medium text-zinc-900">{gender ? GENDER_LABEL[gender] ?? gender : "-"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">닉네임</p>
                  <p className="mt-1.5 truncate text-sm font-medium text-zinc-900">{nickname}</p>
                </div>
                <div className="col-span-2 sm:col-span-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">권한</p>
                  <p className="mt-1.5 text-sm font-medium text-zinc-900">{role}</p>
                </div>
                <div className="col-span-2 sm:col-span-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">가입일</p>
                  <p className="mt-1.5 truncate text-sm font-medium text-zinc-600">{createdAtText}</p>
                </div>
              </div>
              <div className="border-t border-zinc-100 pt-5">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">나의 활동</p>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href="/profile/posts"
                    className="whitespace-nowrap rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-100 hover:text-[var(--color-brand-primary)]"
                  >
                    내가 쓴 게시글
                  </Link>
                  <Link
                    href="/profile/comments"
                    className="whitespace-nowrap rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-100 hover:text-[var(--color-brand-primary)]"
                  >
                    내가 쓴 댓글
                  </Link>
                </div>
              </div>
            </div>
            <div className="flex min-w-0 flex-1 flex-col items-center justify-center border-zinc-100 py-6 md:border-l md:border-zinc-100 md:py-0">
                {myReviews.length > 0 ? (
                  (() => {
                    const avgRating = myReviews.reduce((sum, r) => sum + r.rating, 0) / myReviews.length;
                    const pct = Math.min(1, Math.max(0, avgRating / 10));
                    const arcLength = Math.PI * 48;
                    const dashOffset = arcLength * (1 - pct);
                    const angleRad = Math.PI * (1 - pct);
                    const r = 48;
                    const cx = 64;
                    const cy = 56;
                    const dotX = cx + r * Math.cos(angleRad);
                    const dotY = cy - r * Math.sin(angleRad);

                    const reviewerTypes = [
                      { key: "harsh", label: "Harsh Reviewer", sub: "강하게 비판, 날카로운 스타일" },
                      { key: "critical", label: "Critical Reviewer", sub: "분석 + 균형 잡힌 평가" },
                      { key: "light", label: "Light Reviewer", sub: "가볍게 감상 위주" },
                    ] as const;
                    const currentType =
                      avgRating < 3.5
                        ? reviewerTypes[0]
                        : avgRating < 6.5
                          ? reviewerTypes[1]
                          : reviewerTypes[2];

                    const labelPath = "M 8 56 A 56 56 0 0 1 120 56";
                    const RATING_COMMENTS: Record<number, string> = {
                      0: "취향 문턱이 너무 높으신데요..",
                      1: "쉽게 만족 안 하시는 타입이군요..?",
                      2: "듣는 기준이 확실히 까다롭네요 ㅠㅠ",
                      3: "좋은 점수 받기 쉽지 않겠어요..",
                      4: "기준이 살짝 높은 편이네요..",
                      5: "무난하게 평가하시는 편이네요",
                      6: "여유 있게 들어주시는 느낌이네요~~",
                      7: "음악을 잘 즐기시는 편이네요!!",
                      8: "긍정적으로 많이 들으시는 듯..?",
                      9: "거의 다 좋게 들으시겠어요 ㅎㅎ",
                      10: "음악 자체를 즐기시는 타입이네요!!",
                    };
                    const ratingComment = RATING_COMMENTS[Math.round(avgRating)] ?? RATING_COMMENTS[5];
                    return (
                      <div className="flex flex-col items-center gap-2">
                        <div className="relative h-40 w-48 sm:h-48 sm:w-60">
                          <svg viewBox="0 0 128 88" className="h-full w-full" aria-hidden>
                            <defs>
                              <linearGradient id="profileGaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#5c6ba3" />
                                <stop offset="100%" stopColor="#1E264D" />
                              </linearGradient>
                              <path id="profileLabelPath" d={labelPath} fill="none" />
                            </defs>
                            <path
                              d="M 16 56 A 48 48 0 0 1 112 56"
                              fill="none"
                              stroke="rgb(228 228 231)"
                              strokeWidth="12"
                              strokeLinecap="round"
                            />
                            <path
                              d="M 16 56 A 48 48 0 0 1 112 56"
                              fill="none"
                              stroke="url(#profileGaugeGrad)"
                              strokeWidth="12"
                              strokeLinecap="round"
                              strokeDasharray={arcLength}
                              strokeDashoffset={dashOffset}
                              strokeLinejoin="round"
                              style={{ transition: "stroke-dashoffset 0.6s ease-out" }}
                            />
                            <circle
                           cx={dotX}
                              cy={dotY}
                              r="5"
                              fill="white"
                              stroke="#1E264D"
                              strokeWidth="2"
                            />
                            <text
                              fontSize="5"
                              fontWeight={currentType.key === "harsh" ? 600 : 500}
                              fill={currentType.key === "harsh" ? "#1E264D" : "#71717a"}
                            >
                              <textPath href="#profileLabelPath" startOffset="12%" textAnchor="middle">
                                Harsh Reviewer
                              </textPath>
                            </text>
                            <text
                              fontSize="5"
                              fontWeight={currentType.key === "critical" ? 600 : 500}
                              fill={currentType.key === "critical" ? "#1E264D" : "#71717a"}
                            >
                              <textPath href="#profileLabelPath" startOffset="50%" textAnchor="middle">
                                Critical Reviewer
                              </textPath>
                            </text>
                            <text
                              fontSize="5"
                              fontWeight={currentType.key === "light" ? 600 : 500}
                              fill={currentType.key === "light" ? "#1E264D" : "#71717a"}
                            >
                              <textPath href="#profileLabelPath" startOffset="88%" textAnchor="middle">
                                Light Reviewer
                              </textPath>
                            </text>
                          </svg>
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
                            <span className="text-3xl font-bold text-[#1E264D] sm:text-4xl md:text-5xl">
                              {avgRating.toFixed(1)}
                            </span>
                          </div>
                        </div>
                        <p className="text-center text-xs font-medium text-zinc-600">
                          평론가 <span className="font-semibold text-zinc-900">{nickname}</span> 님의 평균평점
                        </p>
                        <p className="text-center text-base font-bold text-[#1E264D]">
                          {ratingComment}
                        </p>
                      </div>
                    );
                  })()
                ) : (
                  <p className="text-center text-sm text-zinc-400">리뷰를 작성하면 평균 평점이 표시됩니다.</p>
                )}
              </div>
            </div>
          </div>

        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold tracking-tight text-zinc-900">나의 리뷰</h2>
              <Link
                href="/profile/reviews"
                className="text-xs font-medium text-zinc-500 hover:text-[var(--color-brand-primary)]"
              >
                전체보기
              </Link>
            </div>

            <div className="space-y-2">
              {isLoadingReviews ? (
                <p className="text-xs text-zinc-500">불러오는 중...</p>
              ) : myReviews.length === 0 ? (
                <p className="text-xs text-zinc-500">작성한 리뷰가 없습니다.</p>
              ) : (
                myReviews.slice(0, 5).map((review) => (
                    <div
                      key={review.id}
                      className="rounded-xl border border-zinc-100 bg-zinc-50 p-3 transition hover:bg-zinc-100"
                    >
                      <div className="flex items-center gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[10px] font-medium uppercase text-zinc-500">{review.album?.artist}</p>
                          <p className="truncate text-sm font-semibold text-zinc-900">{review.album?.title}</p>
                        </div>
                        {review.rejectReason && (
                          <span className="shrink-0 rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-semibold text-rose-700">
                            반려
                          </span>
                        )}
                        <span className={`shrink-0 text-sm font-bold ${review.rating >= 9 ? "text-red-600" : "text-zinc-900"}`}>{review.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold tracking-tight text-zinc-900">좋아하는 앨범</h2>
              <Link
                href="/profile/albums"
                className="text-xs font-medium text-zinc-500 hover:text-[var(--color-brand-primary)]"
              >
                전체보기
              </Link>
            </div>

            {isLoadingFavorites ? (
              <p className="text-xs text-zinc-500">불러오는 중...</p>
            ) : favoriteAlbums.length === 0 ? (
                <p className="text-xs text-zinc-500">좋아요한 앨범이 없습니다.</p>
            ) : (
              <div className="grid grid-cols-3 grid-rows-2 gap-3">
                {favoriteAlbums.slice(0, 6).map((fav) => (
                  <Link
                    key={fav.id}
                    href={`/review/album/${encodeURIComponent(fav.albumId || (fav.album?.albumId ?? ""))}`}
                    className="flex min-w-0 flex-col gap-2 rounded-xl border border-zinc-100 bg-zinc-50 p-2 transition hover:border-zinc-200 hover:bg-zinc-100"
                  >
                    {fav.album?.imageUrl ? (
                      <Image
                        src={fav.album.imageUrl}
                        className="aspect-square w-full rounded-md object-cover"
                        alt={fav.album?.title ?? "앨범 커버"}
                        width={100}
                        height={100}
                        unoptimized
                      />
                    ) : (
                      <div className="aspect-square w-full rounded-md bg-zinc-100" />
                    )}
                    <div className="min-h-[2rem] min-w-0 space-y-0.5 text-center">
                      <p className="line-clamp-2 w-full text-[10px] font-semibold leading-tight text-zinc-900">
                        {fav.album?.title ?? ""}
                      </p>
                      {fav.album?.artist && (
                        <p className="w-full truncate text-[9px] text-zinc-500">
                          {fav.album.artist}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
          </div>

          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm md:p-8">
            <MyPicksSection />
          </div>
        </div>
      </div>
    </div>
  );
}
