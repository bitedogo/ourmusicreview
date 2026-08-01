/** 리뷰 상세 — RATING·작성자·본문 카드 */

import Link from "next/link";
import Image from "next/image";
import { HtmlRenderer } from "@/src/components/common/HtmlRenderer";
import {
  REVIEW_BORDER_GRAY,
  REVIEW_BRAND_TEAL,
  REVIEW_DETAIL_BODY,
} from "@/src/components/reviews/review-page-styles";
import { getUserProfilePath } from "@/src/components/profile/user-profile-view";
import { reviewEdit } from "@/src/lib/navigation/routes";
import { formatDateYYYYMMDD } from "@/src/lib/utils/date";
import { formatRating, getRatingScoreColor } from "@/src/lib/utils/rating";

export interface ReviewDetailAuthor {
  id: string;
  nickname: string;
  profileImage: string | null;
}

interface ReviewDetailBodyCardProps {
  reviewId: string;
  content: string;
  rating: number;
  createdAt: string;
  rejectReason: string | null;
  user: ReviewDetailAuthor;
  isOwner: boolean;
  onDelete: () => void;
}

type DetailSize = "mobile" | "desktop";

const AVATAR_PX: Record<DetailSize, number> = {
  mobile: 26,
  desktop: 40,
};

function AuthorAvatar({
  user,
  size,
}: {
  user: ReviewDetailAuthor;
  size: DetailSize;
}) {
  const px = AVATAR_PX[size];
  return (
    <Link
      href={getUserProfilePath(user.id)}
      className={`shrink-0 overflow-hidden rounded-full bg-[#D9D9D9] ${REVIEW_DETAIL_BODY.avatar[size]}`}
      aria-label={`${user.nickname} 프로필 보기`}
    >
      {user.profileImage ? (
        <Image
          src={user.profileImage}
          alt=""
          width={px}
          height={px}
          sizes={`${px}px`}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-zinc-600 sm:text-xs">
          {user.nickname.charAt(0).toUpperCase()}
        </div>
      )}
    </Link>
  );
}

function OwnerActions({
  reviewId,
  onDelete,
  size,
}: {
  reviewId: string;
  onDelete: () => void;
  size: DetailSize;
}) {
  const className = REVIEW_DETAIL_BODY.ownerAction[size];
  return (
    <>
      <Link href={reviewEdit(reviewId)} className={className}>
        수정
      </Link>
      <button type="button" onClick={onDelete} className={className}>
        삭제
      </button>
    </>
  );
}

function RatingBox({
  ratingValue,
  ratingColor,
}: {
  ratingValue: number;
  ratingColor: string;
}) {
  return (
    <div
      className={REVIEW_DETAIL_BODY.rating.box}
      style={{
        borderColor: REVIEW_BORDER_GRAY,
        boxShadow: `0px 2px 4px ${ratingColor}`,
      }}
    >
      <span
        className={REVIEW_DETAIL_BODY.rating.label}
        style={{ color: REVIEW_BRAND_TEAL }}
      >
        RATING
      </span>
      <span
        className={REVIEW_DETAIL_BODY.rating.score}
        style={{ color: ratingColor }}
      >
        {formatRating(ratingValue)}
      </span>
    </div>
  );
}

function MobileAuthorHeader({
  user,
  dateText,
  reviewId,
  isOwner,
  onDelete,
}: {
  user: ReviewDetailAuthor;
  dateText: string;
  reviewId: string;
  isOwner: boolean;
  onDelete: () => void;
}) {
  const { author } = REVIEW_DETAIL_BODY;

  return (
    <div className={author.root}>
      <div className={author.row}>
        <div className="flex min-w-0 items-start gap-2">
          <AuthorAvatar user={user} size="mobile" />
          <div className={author.meta}>
            <Link
              href={getUserProfilePath(user.id)}
              className={author.nickname}
            >
              {user.nickname}
            </Link>
            <span className={author.date}>{dateText}</span>
          </div>
        </div>
        {isOwner ? (
          <div className={author.actions}>
            <OwnerActions
              reviewId={reviewId}
              onDelete={onDelete}
              size="mobile"
            />
          </div>
        ) : null}
      </div>
      <div className={author.divider} aria-hidden />
    </div>
  );
}

function DesktopAuthorHeader({
  user,
  dateText,
}: {
  user: ReviewDetailAuthor;
  dateText: string;
}) {
  const { desktopAuthor } = REVIEW_DETAIL_BODY;

  return (
    <div className={desktopAuthor.root}>
      <AuthorAvatar user={user} size="desktop" />
      <Link
        href={getUserProfilePath(user.id)}
        className={desktopAuthor.nickname}
      >
        {user.nickname}
      </Link>
      <span className={desktopAuthor.date}>{dateText}</span>
    </div>
  );
}

export function ReviewDetailBodyCard({
  reviewId,
  content,
  rating,
  createdAt,
  rejectReason,
  user,
  isOwner,
  onDelete,
}: ReviewDetailBodyCardProps) {
  const ratingValue = Number(rating);
  const ratingColor = getRatingScoreColor(ratingValue);
  const dateText = formatDateYYYYMMDD(createdAt);

  return (
    <div className={REVIEW_DETAIL_BODY.root}>
      <div className={REVIEW_DETAIL_BODY.shell}>
        <RatingBox ratingValue={ratingValue} ratingColor={ratingColor} />

        <MobileAuthorHeader
          user={user}
          dateText={dateText}
          reviewId={reviewId}
          isOwner={isOwner}
          onDelete={onDelete}
        />
        <DesktopAuthorHeader user={user} dateText={dateText} />

        <div className={REVIEW_DETAIL_BODY.content}>
          <HtmlRenderer html={content} />
        </div>

        {isOwner ? (
          <div className={REVIEW_DETAIL_BODY.desktopAuthor.actions}>
            <OwnerActions
              reviewId={reviewId}
              onDelete={onDelete}
              size="desktop"
            />
          </div>
        ) : null}

        {rejectReason ? (
          <div className={REVIEW_DETAIL_BODY.reject}>
            반려 사유: {rejectReason}
          </div>
        ) : null}
      </div>
    </div>
  );
}
