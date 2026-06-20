"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ApiClientError, fetchJson, getApiErrorMessage } from "@/src/lib/http/client";
import { buildAlbumReviewPath, getReleaseYear } from "@/src/lib/utils/album";
import { getDisplayRating, getRatingTextClassName } from "@/src/lib/utils/rating";
import type { SearchAlbumResult } from "@/src/lib/search/types";

interface SearchAlbumCardProps {
  album: SearchAlbumResult;
  ratingInfo?: { averageRating: number | null; reviewCount: number };
  isFavorite: boolean;
  isCheckingReview: boolean;
  onToggleFavorite: (album: SearchAlbumResult) => void;
  onRegister: (album: SearchAlbumResult) => void;
}

export function SearchAlbumCard({
  album,
  ratingInfo,
  isFavorite,
  isCheckingReview,
  onToggleFavorite,
  onRegister,
}: SearchAlbumCardProps) {
  const router = useRouter();
  const albumId = album.collectionId.toString();
  const ratingValue = getDisplayRating(ratingInfo?.averageRating, ratingInfo?.reviewCount);
  const ratingClassName = getRatingTextClassName(
    ratingInfo?.averageRating,
    ratingInfo?.reviewCount
  );

  return (
    <div className="flex flex-col rounded-2xl bg-white p-4">
      <div className="text-left">
        <div className="relative mb-3 aspect-square overflow-hidden rounded-xl">
          {album.imageUrl600 ? (
            <Image
              src={album.imageUrl600}
              alt={album.collectionName}
              fill
              unoptimized
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-zinc-100 text-xs text-zinc-400">
              이미지 없음
            </div>
          )}
        </div>

        <div className="min-h-[80px] flex-1 space-y-1">
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold text-zinc-900">
            {album.collectionName}
          </h3>
          <p className="line-clamp-1 text-xs text-zinc-600">{album.artistName}</p>
          {album.primaryGenreName && (
            <p className="text-[11px] text-zinc-500">{album.primaryGenreName}</p>
          )}
          {album.releaseDate && (
            <p className="text-[11px] text-zinc-500">
              {getReleaseYear(album.releaseDate)}
            </p>
          )}
          <div className="mt-1 flex items-center gap-1">
            <span className="text-[10px] text-zinc-600">평점:</span>
            <span className={`text-sm font-bold ${ratingClassName}`}>{ratingValue}</span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggleFavorite(album);
          }}
          className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold transition ${
            isFavorite
              ? "border-red-500 bg-red-50 text-red-500"
              : "border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50"
          }`}
          aria-label="좋아요"
        >
          {isFavorite ? "❤️" : "♡"}
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            router.push(buildAlbumReviewPath(albumId));
          }}
          className="flex-1 rounded-full border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-50"
        >
          리뷰 보기
        </button>
        <button
          type="button"
          disabled={isCheckingReview}
          onClick={(event) => {
            event.stopPropagation();
            void onRegister(album);
          }}
          className="flex-1 rounded-full bg-[var(--color-brand-primary)] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[var(--color-brand-primary-hover)] disabled:cursor-not-allowed disabled:bg-zinc-500"
        >
          {isCheckingReview ? "확인 중..." : "리뷰 작성"}
        </button>
      </div>
    </div>
  );
}
