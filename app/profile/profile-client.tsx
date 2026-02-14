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
  const [favoriteAlbums, setFavoriteAlbums] = useState<FavoriteAlbum[]>([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);
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

        const response = await fetch("/api/reviews");
        const data = await response.json().catch(() => null);

        if (!response.ok || !data?.ok) {
          setMyReviews([]);
          return;
        }

        setMyReviews(data.reviews || []);
      } catch {
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

        const response = await fetch("/api/favorites");
        const data = await response.json().catch(() => null);

        if (!response.ok || !data?.ok) {
          setFavoriteAlbums([]);
          return;
        }

        setFavoriteAlbums(data.favorites || []);
      } catch {
        setFavoriteAlbums([]);
      } finally {
        setIsLoadingFavorites(false);
      }
    }

    fetchFavorites();
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-3 sm:px-6 sm:py-4 md:h-[calc(100vh-120px)] md:min-h-0 md:gap-6 md:overflow-hidden md:px-10">
      <div className="flex items-center justify-between shrink-0">
        <h1 className="text-lg font-semibold tracking-tight text-zinc-900 md:text-xl">
          마이페이지
        </h1>
        <div className="flex items-center gap-3 md:gap-4">
          <Link
            href="/profile/edit"
            className="text-[10px] font-medium text-zinc-500 hover:text-zinc-900 md:text-xs"
          >
            내 정보 수정
          </Link>
          {role !== "ADMIN" && (
            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={isDeletingAccount}
              className="text-[10px] font-medium text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50 md:text-xs"
            >
              {isDeletingAccount ? "처리 중..." : "계정삭제"}
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-hidden md:flex-row md:gap-10">
        <aside className="flex shrink-0 flex-col items-center justify-center border-zinc-100 md:w-1/2 md:border-r md:pr-10">
          <div className="w-full max-w-md space-y-4 md:space-y-10">
            <div className="flex flex-col items-center gap-4 md:gap-10">
              <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-white bg-zinc-100 shadow-md md:h-48 md:w-48 md:border-4">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={nickname}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] font-bold uppercase text-zinc-400 md:text-xs">
                    No Image
                  </div>
                )}
              </div>

              <div className="w-full space-y-2 md:space-y-6">
                <div className="flex items-center gap-2 border-b border-zinc-100 pb-2 md:justify-between md:pb-4">
                  <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-zinc-400 md:text-xs md:tracking-widest">아이디</span>
                  <span className="min-w-0 truncate text-right text-xs font-bold text-zinc-900 md:text-lg">{id}</span>
                </div>
                <div className="flex items-center gap-2 border-b border-zinc-100 pb-2 md:justify-between md:pb-4">
                  <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-zinc-400 md:text-xs md:tracking-widest">닉네임</span>
                  <span className="min-w-0 truncate text-right text-xs font-bold text-zinc-900 md:text-lg">{nickname}</span>
                </div>
                <div className="flex items-center gap-2 border-b border-zinc-100 pb-2 md:justify-between md:pb-4">
                  <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-zinc-400 md:text-xs md:tracking-widest">권한</span>
                  <span className="rounded-full bg-black px-2.5 py-0.5 text-[10px] font-black text-white md:px-4 md:py-1 md:text-xs">
                    {role}
                  </span>
                </div>
                <div className="flex items-center gap-2 md:justify-between">
                  <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-zinc-400 md:text-xs md:tracking-widest">가입일</span>
                  <span className="min-w-0 truncate text-right text-[11px] font-medium text-zinc-600 md:text-sm">{createdAtText}</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden md:w-1/2           md:gap-6">
          <section className="flex shrink-0 flex-col space-y-2 md:space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold tracking-tight text-zinc-900 md:text-sm">나의 리뷰</h2>
              <Link
                href="/profile/reviews"
                className="text-[10px] font-medium text-zinc-400 hover:text-zinc-900"
              >
                전체보기
              </Link>
            </div>

            <div className="space-y-1.5 md:space-y-2">
              {isLoadingReviews ? (
                <p className="text-xs text-zinc-500">불러오는 중...</p>
              ) : myReviews.length === 0 ? (
                <p className="text-xs text-zinc-500">작성한 리뷰가 없습니다.</p>
              ) : (
                myReviews.slice(0, 3).map((review) => (
                  <div
                    key={review.id}
                    className="rounded-xl border border-zinc-100 bg-white p-2 md:p-2.5"
                  >
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[9px] font-bold uppercase text-zinc-400 md:text-[9px]">{review.album?.artist}</p>
                        <p className="truncate text-[11px] font-bold text-zinc-900 md:text-xs">{review.album?.title}</p>
                      </div>
                      <span className="shrink-0 text-xs font-black text-zinc-900">{review.rating.toFixed(1)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="flex min-h-0 flex-1 flex-col space-y-2 overflow-hidden md:space-y-3">
            <div className="flex items-center justify-between shrink-0">
              <h2 className="text-xs font-semibold tracking-tight text-zinc-900 md:text-sm">좋아하는 앨범</h2>
              <Link
                href="/profile/albums"
                className="text-[10px] font-medium text-zinc-400 hover:text-zinc-900"
              >
                전체보기
              </Link>
            </div>

            {isLoadingFavorites ? (
              <p className="text-xs text-zinc-500">불러오는 중...</p>
            ) : favoriteAlbums.length === 0 ? (
              <p className="text-xs text-zinc-500">좋아요한 앨범이 없습니다.</p>
            ) : (
              <>
                <div className="grid grid-cols-4 gap-2 md:hidden">
                  {favoriteAlbums.slice(0, 4).map((fav) => (
                    <Link
                      key={fav.id}
                      href={`/review/album/${encodeURIComponent(fav.albumId || (fav.album?.albumId ?? ""))}`}
                      className="flex min-w-0 flex-col gap-1.5 rounded-lg border border-zinc-100 bg-white p-2 transition hover:border-zinc-300"
                    >
                      {fav.album?.imageUrl ? (
                        <img src={fav.album.imageUrl} className="aspect-square w-full rounded-md object-cover" alt="" />
                      ) : (
                        <div className="aspect-square w-full rounded-md bg-zinc-100" />
                      )}
                      <div className="min-h-[2.5rem] min-w-0 space-y-0.5 text-center">
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
                <div className="hidden flex-1 grid-cols-2 grid-rows-4 gap-2 pb-2 md:grid">
                  {favoriteAlbums.slice(0, 8).map((fav) => (
                    <Link
                      key={fav.id}
                      href={`/review/album/${encodeURIComponent(fav.albumId || (fav.album?.albumId ?? ""))}`}
                      className="flex h-full items-center gap-2 rounded-xl border border-zinc-100 bg-white p-2 transition hover:border-zinc-300"
                    >
                      {fav.album?.imageUrl && (
                        <img src={fav.album.imageUrl} className="h-8 w-8 shrink-0 rounded-md object-contain" alt="" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-zinc-900">{fav.album?.title}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

