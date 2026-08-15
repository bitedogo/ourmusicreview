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
  REVIEW_MOBILE_CARD_SHELL_CLASS,
  REVIEW_MOBILE_COVER_RADIUS_CLASS,
  REVIEW_TEXT,
  reviewArtistLinkClass,
} from "@/src/components/reviews/review-page-styles";
import { formatAlbumReleaseDate } from "@/src/lib/utils/date";
import { formatRating, getRatingScoreColor } from "@/src/lib/utils/rating";

const DESKTOP_COVER_RADIUS_CLASS = "overflow-hidden rounded-[10px]";

const MORE_REVIEW_CLASS = {
  mobile:
    "absolute bottom-[9px] right-[9px] inline-flex h-[16px] w-[62px] items-center justify-center rounded-[5px] text-[8px] font-normal leading-[10px] text-white",
  desktop:
    "absolute bottom-[12px] right-[11px] flex h-[30px] w-[100px] items-center justify-center rounded-[10px] text-[13px] font-normal leading-[16px] text-white transition hover:bg-[var(--color-brand-primary-hover)]",
} as const;

const FOOTER_ACTION_CLASS = {
  mobile: "absolute bottom-[9px] right-[9px]",
  desktop: "absolute bottom-[12px] right-[11px]",
} as const;

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
}: {
  averageRating: number | null;
}) {
  const color = getRatingScoreColor(averageRating);

  return (
    <div className="flex shrink-0 items-baseline gap-[7px]">
      <span
        className="text-[16px] font-medium leading-[19px]"
        style={{ color: REVIEW_BRAND_TEAL }}
      >
        Average Rating
      </span>
      <span className="text-[24px] font-bold leading-[29px]" style={{ color }}>
        {formatRating(averageRating)}
      </span>
    </div>
  );
}

function MobileCoverRatingBadge({
  averageRating,
}: {
  averageRating: number | null;
}) {
  const color = getRatingScoreColor(averageRating);

  return (
    <div className="pointer-events-none absolute -bottom-px -left-px z-[1] flex h-[28px] w-[29px] items-center justify-center rounded-tr-[10px] bg-white">
      <span className="text-[13px] font-bold leading-[16px]" style={{ color }}>
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
  size: keyof typeof MORE_REVIEW_CLASS;
}) {
  return (
    <Link
      href={href}
      className={MORE_REVIEW_CLASS[size]}
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
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="h-full w-full bg-[#D9D9D9]" />
      )}
    </div>
  );
}

function CardFooter({
  size,
  showMoreReview,
  moreHref,
  footerAction,
}: {
  size: keyof typeof MORE_REVIEW_CLASS;
  showMoreReview: boolean;
  moreHref: string;
  footerAction?: ReactNode;
}) {
  if (showMoreReview) {
    return <MoreReviewButton href={moreHref} size={size} />;
  }
  if (!footerAction) return null;
  return <div className={FOOTER_ACTION_CLASS[size]}>{footerAction}</div>;
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
  const footerProps = { showMoreReview, moreHref, footerAction };

  return (
    <>
      <div
        className={`relative hidden h-[160px] w-[800px] max-w-full sm:block ${REVIEW_CARD_SHELL_CLASS}`}
      >
        <div className={`relative h-full ${REVIEW_CARD_CLIP_CLASS}`}>
          <AlbumCoverImage
            imageUrl={album.imageUrl}
            title={album.title}
            size={150}
            className={`absolute left-[6.5px] top-[6px] h-[148px] w-[150px] ${DESKTOP_COVER_RADIUS_CLASS}`}
          />

          <h2
            className={`absolute left-[172.5px] right-[172px] top-[19px] truncate text-[24px] font-medium leading-[29px] ${REVIEW_TEXT.title}`}
          >
            {album.title}
          </h2>
          <p
            className={`absolute left-[172.5px] right-[172px] top-[47px] truncate text-[16px] font-normal leading-[19px] ${REVIEW_TEXT.artist}`}
          >
            <ArtistNameLink
              name={album.artist}
              artistId={album.artistId}
              className={reviewArtistLinkClass(
                `text-[16px] font-normal leading-[19px] ${REVIEW_TEXT.artist}`,
              )}
            />
          </p>
          <p
            className={`absolute left-[172.5px] top-[93px] text-[14px] font-normal leading-[17px] ${REVIEW_TEXT.meta}`}
          >
            {releaseLabel}
          </p>
          <p
            className={`absolute left-[172.5px] top-[125px] text-[14px] font-normal leading-[17px] ${REVIEW_TEXT.meta}`}
          >
            {genreLabel}
          </p>

          <div className="absolute right-[17px] top-[19px]">
            <AverageRatingLabel averageRating={averageRating} />
          </div>

          <CardFooter size="desktop" {...footerProps} />
        </div>
      </div>

      <div
        className={`relative block h-[100px] w-full sm:hidden ${REVIEW_MOBILE_CARD_SHELL_CLASS}`}
      >
        <div className="relative h-full w-full">
          <div className="absolute left-[8px] top-[7px] h-[83px] w-[83px]">
            <div
              className={`relative h-full w-full ${REVIEW_MOBILE_COVER_RADIUS_CLASS}`}
            >
              <div className="absolute inset-0 overflow-hidden rounded-[inherit]">
                <AlbumCoverImage
                  imageUrl={album.imageUrl}
                  title={album.title}
                  size={83}
                  className="h-full w-full"
                />
              </div>
              <MobileCoverRatingBadge averageRating={averageRating} />
            </div>
          </div>

          <h2
            className={`absolute left-[101px] right-[16px] top-[13px] truncate text-[16px] font-medium leading-[19px] ${REVIEW_TEXT.title}`}
          >
            {album.title}
          </h2>
          <p
            className={`absolute left-[101px] right-[16px] top-[31px] truncate text-[13px] font-normal leading-[16px] ${REVIEW_TEXT.artist}`}
          >
            <ArtistNameLink
              name={album.artist}
              artistId={album.artistId}
              className={reviewArtistLinkClass(
                `text-[13px] font-normal leading-[16px] ${REVIEW_TEXT.artist}`,
              )}
            />
          </p>
          <p
            className={`absolute left-[101px] top-[66px] text-[8px] font-normal leading-[10px] ${REVIEW_TEXT.meta}`}
          >
            {releaseLabel}
          </p>
          <p
            className={`absolute left-[101px] top-[82px] max-w-[calc(100%-180px)] truncate text-[8px] font-normal leading-[10px] ${REVIEW_TEXT.meta}`}
          >
            {genreLabel}
          </p>

          <CardFooter size="mobile" {...footerProps} />
        </div>
      </div>
    </>
  );
}
