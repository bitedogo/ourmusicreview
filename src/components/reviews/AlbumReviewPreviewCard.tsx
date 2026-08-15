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
  REVIEW_MOBILE_CARD_SHELL_CLASS,
  REVIEW_MOBILE_COVER_RADIUS_CLASS,
  REVIEW_TEXT,
  reviewArtistLinkClass,
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
  const ratingProps = {
    text: formatRating(ratingValue),
    color: getRatingScoreColor(ratingValue),
  };
  const dateText = formatDateDottedSpaced(createdAt);
  const author = authorNickname ?? "익명";

  return (
    <Link
      href={href}
      className="relative block w-full transition hover:opacity-[0.98]"
    >
      <article
        className={`relative box-border block h-[100px] w-full sm:hidden ${REVIEW_MOBILE_CARD_SHELL_CLASS}`}
      >
        <ReviewAlbumCover
          imageUrl={imageUrl}
          alt={albumTitle}
          width={83}
          height={83}
          className={`absolute left-[9px] top-[8px] h-[83px] w-[83px] ${REVIEW_MOBILE_COVER_RADIUS_CLASS}`}
          rating={{ ...ratingProps, size: "mobile" }}
        />

        <h3
          className={`absolute left-[102px] right-[68px] top-[12px] truncate text-[16px] font-medium leading-[19px] ${REVIEW_TEXT.title}`}
        >
          {albumTitle}
        </h3>
        <p
          className={`absolute left-[102px] right-[68px] top-[28px] truncate text-[13px] font-normal leading-[16px] ${REVIEW_TEXT.artistMuted}`}
        >
          <ArtistNameLink
            name={artist}
            className={reviewArtistLinkClass(
              `text-[13px] font-normal leading-[16px] ${REVIEW_TEXT.artistMuted}`,
            )}
          />
        </p>

        <div className="absolute right-[14px] top-[18px] flex items-center gap-[8px]">
          <ReviewLikeCount count={likeCount} size="mobile" />
          <ReviewCommentCount count={commentCount} size="mobile" />
        </div>

        <p
          className={`absolute left-[103px] right-[14px] top-[66px] truncate text-[8px] font-normal leading-[10px] ${REVIEW_TEXT.preview}`}
        >
          {preview}
        </p>
        <span
          className={`absolute left-[103px] top-[82px] max-w-[160px] truncate text-[8px] font-normal leading-[10px] ${REVIEW_TEXT.meta}`}
        >
          {author}
        </span>
        <span
          className={`absolute right-[14px] top-[82px] text-[8px] font-normal leading-[10px] ${REVIEW_TEXT.meta}`}
        >
          {dateText}
        </span>
      </article>

      <article
        className={`relative hidden w-full sm:block ${REVIEW_CARD_SHELL_CLASS}`}
      >
        <div className={`relative h-[160px] ${REVIEW_CARD_CLIP_CLASS}`}>
          <ReviewAlbumCover
            imageUrl={imageUrl}
            alt={albumTitle}
            width={150}
            height={150}
            className={`absolute left-[6px] top-[5px] h-[150px] w-[150px] ${REVIEW_COVER_RADIUS_CLASS}`}
            rating={{ ...ratingProps, size: "desktop" }}
          />

          <h3
            className={`absolute left-[173px] right-[120px] top-[13px] truncate text-[24px] font-medium leading-[29px] ${REVIEW_TEXT.title}`}
          >
            {albumTitle}
          </h3>
          <p
            className={`absolute left-[173px] right-[120px] top-[41px] truncate text-[16px] font-normal leading-[19px] ${REVIEW_TEXT.artistMuted}`}
          >
            <ArtistNameLink
              name={artist}
              className={reviewArtistLinkClass(
                `text-[16px] font-normal leading-[19px] ${REVIEW_TEXT.artistMuted}`,
              )}
            />
          </p>

          <div className="absolute right-[37px] top-[29px] flex items-center gap-[10px]">
            <ReviewLikeCount count={likeCount} />
            <ReviewCommentCount count={commentCount} />
          </div>

          <p
            className={`absolute left-[173px] top-[95px] w-[594px] max-w-[calc(100%-193px)] truncate text-[14px] font-medium leading-[17px] ${REVIEW_TEXT.preview}`}
          >
            {preview}
          </p>
          <span
            className={`absolute left-[173px] top-[127px] max-w-[400px] truncate text-[14px] font-normal leading-[17px] ${REVIEW_TEXT.meta}`}
          >
            {author}
          </span>
          <span
            className={`absolute right-[37px] top-[127px] text-[14px] font-normal leading-[17px] ${REVIEW_TEXT.meta}`}
          >
            {dateText}
          </span>
        </div>
      </article>
    </Link>
  );
}
