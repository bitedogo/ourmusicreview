"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";

interface ProfileClientProps {
  id: string;
  nickname: string;
  role: "USER" | "ADMIN";
  createdAtText: string;
  profileImage: string | null;
}

interface MyReview {
  id: string;
  content: string;
  rating: number;
  isApproved: "Y" | "N";
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

export function ProfileClient({
  id,
  nickname,
  role,
  createdAtText,
  profileImage,
}: ProfileClientProps) {
  const [myReviews, setMyReviews] = useState<MyReview[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [, setReviewsError] = useState<string | null>(null);
  const [favoriteAlbums, setFavoriteAlbums] = useState<FavoriteAlbum[]>([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);
  const [, setFavoritesError] = useState<string | null>(null);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const router = useRouter();

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
      router.push("/");
      router.refresh();
    } catch {
      alert("계정 삭제 중 오류가 발생했습니다.");
    } finally {
      setIsDeletingAccount(false);
    }
  }

  useEffect(() => {
    async function fetchMyReviews() {
      try {
        setIsLoadingReviews(true);
        setReviewsError(null);

        const response = await fetch("/api/reviews");
        const data = await response.json().catch(() => null);

        if (!response.ok || !data?.ok) {
          setReviewsError(
            data?.error ?? `리뷰 목록을 불러오지 못했습니다. (status: ${response.status})`
          );
          setMyReviews([]);
          return;
        }

        setMyReviews(data.reviews || []);
      } catch (error) {
        setReviewsError(
          error instanceof Error
            ? `리뷰 목록을 불러오는 중 오류가 발생했습니다: ${error.message}`
            : "리뷰 목록을 불러오는 중 알 수 없는 오류가 발생했습니다."
        );
        setMyReviews([]);
      } finally {
        setIsLoadingReviews(false);
      }
    }

    fetchMyReviews();
  }, []);

  useEffect(() => {
    async function fetchFavorites() {
      try {
        setIsLoadingFavorites(true);
        setFavoritesError(null);

        const response = await fetch("/api/favorites");
        const data = await response.json().catch(() => null);

        if (!response.ok || !data?.ok) {
          // 로그인 만료 등의 경우 조용히 무시
          if (response.status !== 401) {
            setFavoritesError(
              data?.error ??
                `좋아요한 앨범을 불러오지 못했습니다. (status: ${response.status})`
            );
          }
          setFavoriteAlbums([]);
          return;
        }

        setFavoriteAlbums(data.favorites || []);
      } catch (error) {
        setFavoritesError(
          error instanceof Error
            ? `좋아요한 앨범을 불러오는 중 오류가 발생했습니다: ${error.message}`
            : "좋아요한 앨범을 불러오는 중 알 수 없는 오류가 발생했습니다."
        );
        setFavoriteAlbums([]);
      } finally {
        setIsLoadingFavorites(false);
      }
    }

    fetchFavorites();
  }, []);

  return (
    <div className="mx-auto flex h-[calc(100vh-120px)] w-full max-w-5xl flex-col gap-6 px-6 py-4 sm:px-10 overflow-hidden">
      {/* 상단: 마이페이지 타이틀 */}
      <div className="flex items-center justify-between shrink-0">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
          마이페이지
        </h1>
        <div className="flex items-center gap-4">
          <Link
            href="/profile/edit"
            className="text-xs font-medium text-zinc-500 hover:text-zinc-900"
          >
            내 정보 수정
          </Link>
          {role !== "ADMIN" && (
            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={isDeletingAccount}
              className="text-xs font-medium text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isDeletingAccount ? "처리 중..." : "계정삭제"}
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 gap-10 overflow-hidden">
        {/* 왼쪽: 내 정보 (화면의 50% 차지) */}
        <aside className="flex w-1/2 flex-col items-center justify-center border-r border-zinc-100 pr-10">
          <div className="w-full max-w-md space-y-10">
            <div className="flex flex-col items-center gap-10">
              {/* 프로필 이미지 (더 크게) */}
              <div className="h-48 w-48 overflow-hidden rounded-full bg-zinc-100 shadow-md border-4 border-white">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={nickname}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs font-bold text-zinc-400 uppercase">
                    No Image
                  </div>
                )}
              </div>

              {/* 텍스트 정보 (더 큼직하게) */}
              <div className="w-full space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">아이디</span>
                  <span className="text-lg font-bold text-zinc-900">{id}</span>
                </div>
                <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">닉네임</span>
                  <span className="text-lg font-bold text-zinc-900">{nickname}</span>
                </div>
                <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">권한</span>
                  <span className="rounded-full bg-black px-4 py-1 text-xs font-black text-white">
                    {role}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">가입일</span>
                  <span className="text-sm font-medium text-zinc-600">{createdAtText}</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* 오른쪽: 리뷰 및 앨범 (화면의 50% 차지, 상하 배열) */}
        <div className="flex w-1/2 flex-col gap-6 overflow-hidden">
          {/* 나의 리뷰 (최대 3개 고정) */}
          <section className="flex flex-col space-y-3 shrink-0">
            <div className="flex items-center justify-between shrink-0">
              <h2 className="text-sm font-semibold tracking-tight text-zinc-900">나의 리뷰</h2>
              <Link
                href="/profile/reviews"
                className="text-[10px] font-medium text-zinc-400 hover:text-zinc-900"
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
                myReviews.slice(0, 3).map((review) => (
                  <div
                    key={review.id}
                    className="rounded-xl border border-zinc-100 bg-white p-2.5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[9px] font-bold text-zinc-400 uppercase">{review.album?.artist}</p>
                        <p className="truncate text-xs font-bold text-zinc-900">{review.album?.title}</p>
                      </div>
                      <span className="text-xs font-black text-zinc-900">{review.rating.toFixed(1)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* 좋아하는 앨범 (최대 8개 고정 - 스크롤 없이 한눈에) */}
          <section className="flex flex-1 flex-col space-y-3 overflow-hidden">
            <div className="flex items-center justify-between shrink-0">
              <h2 className="text-sm font-semibold tracking-tight text-zinc-900">좋아하는 앨범</h2>
              <Link
                href="/profile/albums"
                className="text-[10px] font-medium text-zinc-400 hover:text-zinc-900"
              >
                전체보기
              </Link>
            </div>

            <div className="grid flex-1 grid-cols-2 grid-rows-4 gap-2 pb-2">
              {isLoadingFavorites ? (
                <p className="text-xs text-zinc-500 col-span-2">불러오는 중...</p>
              ) : favoriteAlbums.length === 0 ? (
                <p className="text-xs text-zinc-500 col-span-2">좋아요한 앨범이 없습니다.</p>
              ) : (
                favoriteAlbums.slice(0, 8).map((fav) => (
                  <Link
                    key={fav.id}
                    href={`/review/album/${encodeURIComponent(fav.albumId || (fav.album?.albumId ?? ""))}`}
                    className="flex h-full items-center gap-2 rounded-xl border border-zinc-100 bg-white p-2 transition hover:border-zinc-300"
                  >
                    {fav.album?.imageUrl && (
                      <img src={fav.album.imageUrl} className="h-8 w-8 rounded-md object-contain shrink-0" alt="" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-zinc-900">{fav.album?.title}</p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

