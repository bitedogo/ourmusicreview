"use client";
/** 리뷰 상세·앨범 리뷰 — 앨범 정보 카드 */

import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArtistNameLink } from "@/src/components/app/artist-name-link";
import {
  REVIEW_BRAND_TEAL,
  REVIEW_CARD_CLIP_CLASS,
  REVIEW_CARD_SHELL_CLASS,
} from "@/src/components/reviews/review-page-styles";
import { formatAlbumReleaseDate } from "@/src/lib/utils/date";
import { formatRating, getRatingScoreColor } from "@/src/lib/utils/rating";

/** 상세 앨범 카드 커버 — 네 모서리 모두 R (레이팅 배지 없음) */
const DETAIL_COVER_RADIUS_CLASS = "overflow-hidden rounded-[10px]";

export interface ReviewDetailAlbum {
  albumId: string;
  title: string;
  artist: string;
  artistId?: string | null;
  imageUrl: string | null;
  genre: string | null;
  releaseDate: string | null;
}

interface ReviewDetailAlbumCardProps {
  album: ReviewDetailAlbum;
  averageRating: number | null;
  /** false면 More Review 숨김 (앨범 리뷰 목록 페이지용) */
  showMoreReview?: boolean;
  /** More Review 대신 우하단 액션 (스트리밍 링크 등) */
  footerAction?: ReactNode;
}

function AverageRatingLabel({
  averageRating,
  size,
}: {
  averageRating: number | null;
  size: "mobile" | "desktop";
}) {
  const color = getRatingScoreColor(averageRating);
  const isMobile = size === "mobile";

  return (
    <div
      className={`flex shrink-0 items-baseline ${
        isMobile ? "gap-[3px] pt-[1px]" : "gap-[7px]"
      }`}
    >
      <span
        className={`font-medium ${
          isMobile ? "text-[10px]" : "text-[16px] leading-[19px]"
        }`}
        style={{ color: REVIEW_BRAND_TEAL }}
      >
        Average Rating
      </span>
      <span
        className={`font-bold ${
          isMobile ? "text-[15px] leading-none" : "text-[24px] leading-[29px]"
        }`}
        style={{ color }}
      >
        {formatRating(averageRating)}
      </span>
    </div>
  );
}

function MoreReviewButton({
  href,
  size,
}: {
  href: string;
  size: "mobile" | "desktop";
}) {
  const isMobile = size === "mobile";
  return (
    <Link
      href={href}
      className={
        isMobile
          ? "absolute bottom-[8px] right-[8px] inline-flex h-[26px] items-center rounded-[10px] px-3 text-[11px] text-white"
          : "absolute bottom-[12px] right-[11px] flex h-[30px] w-[100px] items-center justify-center rounded-[10px] text-[13px] font-normal leading-[16px] text-white transition hover:bg-[var(--color-brand-primary-hover)]"
      }
      style={{ backgroundColor: REVIEW_BRAND_TEAL }}
    >
      More Review
    </Link>
  );
}

function AlbumCoverImage({
  imageUrl,
  title,
  size,
  className,
}: {
  imageUrl: string | null;
  title: string;
  size: number;
  className: string;
}) {
  return (
    <div className={className}>
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={title}
          width={size}
          height={size}
          unoptimized
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="h-full w-full bg-[#D9D9D9]" />
      )}
    </div>
  );
}

export function ReviewDetailAlbumCard({
  album,
  averageRating,
  showMoreReview = true,
  footerAction,
}: ReviewDetailAlbumCardProps) {
  const genreLabel = album.genre?.trim() || "장르 정보 없음";
  const releaseLabel = `발매일 ${formatAlbumReleaseDate(album.releaseDate)}`;
  const moreHref = `/review/album/${encodeURIComponent(album.albumId)}`;

  const footer =
    showMoreReview ? (
      <MoreReviewButton href={moreHref} size="desktop" />
    ) : footerAction ? (
      <div className="absolute bottom-[12px] right-[11px]">{footerAction}</div>
    ) : null;

  const mobileFooter =
    showMoreReview ? (
      <MoreReviewButton href={moreHref} size="mobile" />
    ) : footerAction ? (
      <div className="absolute bottom-[8px] right-[8px]">{footerAction}</div>
    ) : null;

  return (
    <>
      {/* 데스크톱 */}
      <div
        className={`relative hidden h-[140px] w-full sm:block ${REVIEW_CARD_SHELL_CLASS}`}
      >
        <div className={`relative h-full ${REVIEW_CARD_CLIP_CLASS}`}>
          <AlbumCoverImage
            imageUrl={album.imageUrl}
            title={album.title}
            size={128}
            className={`absolute left-[6px] top-[6px] h-[128px] w-[128px] ${DETAIL_COVER_RADIUS_CLASS}`}
          />

          <h2 className="absolute left-[150px] right-[190px] top-[16px] truncate text-[24px] font-medium leading-[29px] text-black">
            {album.title}
          </h2>
          <p className="absolute left-[150px] right-[190px] top-[44px] truncate text-[16px] font-normal leading-[19px] text-[#D9D9D9]">
            <ArtistNameLink
              name={album.artist}
              artistId={album.artistId}
              className="max-w-full truncate text-left text-[16px] font-normal leading-[19px] text-[#D9D9D9] transition hover:text-[var(--color-brand-primary)] hover:underline disabled:cursor-wait disabled:no-underline"
            />
          </p>
          <p className="absolute left-[150px] top-[90px] text-[14px] font-normal leading-[17px] text-black">
            {releaseLabel}
          </p>
          <p className="absolute left-[150px] top-[116px] text-[14px] font-normal leading-[17px] text-black">
            {genreLabel}
          </p>

          <div className="absolute right-[11px] top-[16px]">
            <AverageRatingLabel averageRating={averageRating} size="desktop" />
          </div>

          {footer}
        </div>
      </div>

      {/* 모바일 */}
      <div
        className={`relative block w-full p-[8px] sm:hidden ${REVIEW_CARD_SHELL_CLASS}`}
      >
        <div className="flex gap-[10px]">
          <AlbumCoverImage
            imageUrl={album.imageUrl}
            title={album.title}
            size={96}
            className={`h-[96px] w-[96px] shrink-0 ${DETAIL_COVER_RADIUS_CLASS}`}
          />
          <div className="flex min-h-[96px] min-w-0 flex-1 flex-col pr-[2px]">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-[16px] font-medium leading-[20px] text-black">
                  {album.title}
                </h2>
                <p className="truncate text-[16px] font-normal leading-[19px] text-[#D9D9D9]">
                  <ArtistNameLink
                    name={album.artist}
                    artistId={album.artistId}
                    className="max-w-full truncate text-left text-[16px] font-normal leading-[19px] text-[#D9D9D9] transition hover:text-[var(--color-brand-primary)] hover:underline disabled:cursor-wait disabled:no-underline"
                  />
                </p>
              </div>
              <AverageRatingLabel averageRating={averageRating} size="mobile" />
            </div>
            <div className="mt-auto max-w-[calc(100%-88px)] pb-[2px]">
              <p className="mb-[4px] text-[11px] leading-[14px] text-black">
                {releaseLabel}
              </p>
              <p className="text-[11px] leading-[14px] text-black">{genreLabel}</p>
            </div>
          </div>
        </div>
        {mobileFooter}
      </div>
    </>
  );
}
