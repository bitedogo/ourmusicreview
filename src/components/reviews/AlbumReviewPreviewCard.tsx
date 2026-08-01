"use client";
/** 앨범 리뷰 목록 미리보기 카드 */

import Link from "next/link";
import { ArtistNameLink } from "@/src/components/app/artist-name-link";
import {
  ReviewCommentCount,
  ReviewLikeCount,
} from "@/src/components/reviews/review-card-icons";
import { ReviewAlbumCover } from "@/src/components/reviews/review-rating-badge";
import {
  REVIEW_CARD_CLIP_CLASS,
  REVIEW_CARD_SHELL_CLASS,
  REVIEW_COVER_RADIUS_CLASS,
} from "@/src/components/reviews/review-page-styles";
import { formatDateDottedSpaced } from "@/src/lib/utils/date";
import { formatRating, getRatingScoreColor } from "@/src/lib/utils/rating";

export interface AlbumReviewPreviewCardProps {
  href: string;
  albumTitle: string;
  artist: string;
  imageUrl: string | null;
  rating: number;
  previewText: string;
  authorNickname: string | null;
  createdAt: string;
  likeCount: number;
  commentCount: number;
}

export function AlbumReviewPreviewCard({
  href,
  albumTitle,
  artist,
  imageUrl,
  rating,
  previewText,
  authorNickname,
  createdAt,
  likeCount,
  commentCount,
}: AlbumReviewPreviewCardProps) {
  const preview = previewText.replace(/\s+/g, " ").trim() || "내용 없음";
  const ratingValue = Number(rating);
  const ratingText = formatRating(ratingValue);
  const ratingColor = getRatingScoreColor(ratingValue);
  const dateText = formatDateDottedSpaced(createdAt);
  const author = authorNickname ?? "익명";
  const ratingProps = { text: ratingText, color: ratingColor };

  return (
    <Link
      href={href}
      className="relative block w-full transition hover:opacity-[0.98]"
    >
      {/*
        모바일 — 패딩 안 inset 커버.
        좌하단만 직각(REVIEW_COVER_RADIUS) + 배지 1px 오버랩으로
        커버 하단 AA 헤어라인 제거.
      */}
      <article
        className={`relative box-border flex min-h-[120px] w-full gap-3 p-3 sm:hidden ${REVIEW_CARD_SHELL_CLASS}`}
      >
        <ReviewAlbumCover
          imageUrl={imageUrl}
          alt={albumTitle}
          width={96}
          height={96}
          className={`h-[96px] w-[96px] shrink-0 ${REVIEW_COVER_RADIUS_CLASS}`}
          rating={{ ...ratingProps, size: "mobile" }}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-[16px] font-medium leading-[20px] text-black">
                {albumTitle}
              </h3>
              <p className="truncate text-[13px] font-normal leading-[16px] text-[#A9A9A9]">
                <ArtistNameLink
                  name={artist}
                  className="max-w-full truncate text-left text-[13px] font-normal leading-[16px] text-[#A9A9A9] transition hover:text-[var(--color-brand-primary)] hover:underline disabled:cursor-wait disabled:no-underline"
                />
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <ReviewLikeCount count={likeCount} />
              <ReviewCommentCount count={commentCount} />
            </div>
          </div>
          <p className="mt-2 truncate text-[13px] font-medium text-[#C0C0C0]">
            {preview}
          </p>
          <div className="mt-auto flex items-center justify-between pt-2 text-[13px] text-black">
            <span className="truncate">{author}</span>
            <span className="shrink-0">{dateText}</span>
          </div>
        </div>
      </article>

      {/* 데스크톱 — Figma inset: left 7 / top 6 / 150×148 */}
      <article
        className={`relative hidden w-full sm:block ${REVIEW_CARD_SHELL_CLASS}`}
      >
        <div className={`relative h-[160px] ${REVIEW_CARD_CLIP_CLASS}`}>
          <ReviewAlbumCover
            imageUrl={imageUrl}
            alt={albumTitle}
            width={150}
            height={148}
            className={`absolute left-[7px] top-[6px] h-[148px] w-[150px] ${REVIEW_COVER_RADIUS_CLASS}`}
            rating={{ ...ratingProps, size: "desktop" }}
          />

          <h3 className="absolute left-[173px] right-[120px] top-[19px] truncate text-[24px] font-medium leading-[29px] text-black">
            {albumTitle}
          </h3>
          <p className="absolute left-[173px] right-[120px] top-[47px] truncate text-[16px] font-normal leading-[19px] text-[#A9A9A9]">
            <ArtistNameLink
              name={artist}
              className="max-w-full truncate text-left text-[16px] font-normal leading-[19px] text-[#A9A9A9] transition hover:text-[var(--color-brand-primary)] hover:underline disabled:cursor-wait disabled:no-underline"
            />
          </p>

          <div className="absolute right-[37px] top-[29px] flex items-center gap-[10px]">
            <ReviewLikeCount count={likeCount} />
            <ReviewCommentCount count={commentCount} />
          </div>

          <p className="absolute left-[173px] top-[86px] w-[594px] max-w-[calc(100%-193px)] truncate text-[14px] font-medium leading-[17px] text-[#C0C0C0]">
            {preview}
          </p>
          <span className="absolute left-[173px] top-[120px] max-w-[400px] truncate text-[14px] font-normal leading-[17px] text-black">
            {author}
          </span>
          <span className="absolute right-[37px] top-[120px] text-[14px] font-normal leading-[17px] text-black">
            {dateText}
          </span>
        </div>
      </article>
    </Link>
  );
}
