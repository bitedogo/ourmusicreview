"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import type { AlbumRatingInfo } from "@/src/hooks/use-batch-album-ratings";
import type { SearchAlbumResult } from "@/src/lib/search/types";
import type { AlbumStreamingLinks } from "@/src/lib/streaming/types";
import { ALBUM_COVER_PLACEHOLDER } from "@/src/lib/site/copy";
import { StreamingLinkButtons } from "@/src/components/streaming/streaming-link-buttons";
import { buildAlbumReviewPath, getReleaseYear } from "@/src/lib/utils/album";
import { getDisplayRating, getRatingScoreColor } from "@/src/lib/utils/rating";

interface SearchAlbumCardProps {
  album: SearchAlbumResult;
  ratingInfo?: AlbumRatingInfo;
  streamingLinks?: AlbumStreamingLinks;
  isFavorite: boolean;
  isCheckingReview: boolean;
  onToggleFavorite: (album: SearchAlbumResult) => void;
  onRegister: (album: SearchAlbumResult) => void;
}

export function SearchAlbumCard({
  album,
  ratingInfo,
  streamingLinks,
  isFavorite,
  isCheckingReview,
  onToggleFavorite,
  onRegister,
}: SearchAlbumCardProps) {
  const router = useRouter();
  const albumId = album.collectionId.toString();
  const ratingValue = getDisplayRating(ratingInfo?.averageRating, ratingInfo?.reviewCount);
  const ratingColor = getRatingScoreColor(
    ratingInfo?.reviewCount ? ratingInfo.averageRating : null
  );

  return (
    <div className="flex flex-col rounded-[var(--featured-card-radius)] bg-white p-[var(--featured-card-padding)]">
      <div className="text-left">
        <div className="relative mb-[var(--featured-card-inner-gap)] aspect-square overflow-hidden rounded-[var(--featured-cover-radius)]">
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
            <div className="flex h-full w-full items-center justify-center bg-zinc-100 text-[length:var(--text-featured-meta)] text-[var(--color-text-muted)]">
              {ALBUM_COVER_PLACEHOLDER}
            </div>
          )}
        </div>

        <div className="min-h-[80px] flex-1 space-y-1">
          <h3 className="line-clamp-2 min-h-[2.5rem] text-[length:var(--text-featured-title)] font-semibold text-[var(--color-text-primary)]">
            {album.collectionName}
          </h3>
          <p className="line-clamp-1 text-[length:var(--text-featured-artist)] text-[var(--color-text-secondary)]">
            {album.artistName}
          </p>
          {album.primaryGenreName && (
            <p className="text-[length:var(--text-featured-meta)] text-[var(--color-text-muted)]">
              {album.primaryGenreName}
            </p>
          )}
          {album.releaseDate && (
            <p className="text-[length:var(--text-featured-meta)] text-[var(--color-text-muted)]">
              {getReleaseYear(album.releaseDate)}
            </p>
          )}
          <div className="mt-1 flex items-center gap-1">
            <span className="text-[length:var(--text-featured-meta)] text-[var(--color-text-secondary)]">
              평점:
            </span>
            <span
              className="text-[length:var(--text-featured-rating)] font-bold"
              style={{ color: ratingColor }}
            >
              {ratingValue}
            </span>
          </div>
        </div>
      </div>

      <StreamingLinkButtons
        links={streamingLinks}
        className="mt-[var(--featured-card-inner-gap)]"
      />

      <div className="mt-[var(--featured-card-inner-gap)] flex items-center gap-2">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggleFavorite(album);
          }}
          className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold transition ${
            isFavorite
              ? "border-red-500 bg-red-50 text-red-500"
              : "border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:bg-zinc-50"
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
          className="flex-1 rounded-full border border-[var(--color-border)] bg-white px-3 py-2 text-[length:var(--text-featured-meta)] font-semibold text-[var(--color-text-primary)] transition hover:bg-zinc-50"
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
          className="flex-1 rounded-full bg-[var(--color-brand-primary)] px-3 py-2 text-[length:var(--text-featured-meta)] font-semibold text-white transition hover:bg-[var(--color-brand-primary-hover)] disabled:cursor-not-allowed disabled:bg-zinc-500"
        >
          {isCheckingReview ? "확인 중..." : "리뷰 작성"}
        </button>
      </div>
    </div>
  );
}
