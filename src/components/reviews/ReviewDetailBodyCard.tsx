/** 리뷰 상세 — RATING·작성자·본문 카드 */

import Link from "next/link";
import Image from "next/image";
import { HtmlRenderer } from "@/src/components/common/HtmlRenderer";
import {
  REVIEW_BORDER_GRAY,
  REVIEW_BRAND_TEAL,
  REVIEW_CARD_SHELL_CLASS,
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

const OWNER_ACTION_CLASS: Record<DetailSize, string> = {
  mobile:
    "text-[10px] font-normal leading-[12px] text-[#D9D9D9] transition-colors hover:text-[var(--color-brand-primary)]",
  desktop:
    "text-xs font-medium text-zinc-400 transition-colors hover:text-[var(--color-brand-primary)]",
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
      className={`shrink-0 overflow-hidden rounded-full bg-[#D9D9D9] ${
        size === "mobile" ? "h-[26px] w-[26px]" : "h-10 w-10"
      }`}
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
  const className = OWNER_ACTION_CLASS[size];
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
  return (
    <div
      className={`relative flex items-start justify-between gap-2 border-b border-[#D9D9D9] pb-3 pr-3 pt-3 sm:hidden ${REVIEW_DETAIL_BODY.authorOffset.mobile}`}
    >
      <div className="flex min-w-0 items-start gap-2">
        <AuthorAvatar user={user} size="mobile" />
        <div className="min-w-0">
          <Link
            href={getUserProfilePath(user.id)}
            className="block truncate text-[12px] font-medium leading-[14px] text-black hover:underline"
          >
            {user.nickname}
          </Link>
          <span className="mt-0.5 block text-[10px] font-normal leading-[12px] text-[#D9D9D9]">
            {dateText}
          </span>
        </div>
      </div>
      {isOwner ? (
        <div className="flex shrink-0 items-center gap-1.5 pt-0.5">
          <OwnerActions reviewId={reviewId} onDelete={onDelete} size="mobile" />
        </div>
      ) : null}
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
  return (
    <div
      className={`absolute top-[23px] z-[1] hidden min-w-0 items-center gap-[14px] sm:flex ${REVIEW_DETAIL_BODY.authorOffset.desktop}`}
    >
      <AuthorAvatar user={user} size="desktop" />
      <Link
        href={getUserProfilePath(user.id)}
        className="min-w-0 truncate text-[24px] font-medium leading-[29px] text-black hover:underline"
      >
        {user.nickname}
      </Link>
      <span className="shrink-0 text-[14px] font-normal leading-[17px] text-black">
        {dateText}
      </span>
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
    <div
      className={`relative w-full overflow-visible ${REVIEW_DETAIL_BODY.gapFromAlbum.mobile} ${REVIEW_DETAIL_BODY.gapFromAlbum.desktop}`}
    >
      <div
        className={`relative w-full overflow-visible ${REVIEW_CARD_SHELL_CLASS}`}
      >
        <RatingBox ratingValue={ratingValue} ratingColor={ratingColor} />

        <MobileAuthorHeader
          user={user}
          dateText={dateText}
          reviewId={reviewId}
          isOwner={isOwner}
          onDelete={onDelete}
        />
        <DesktopAuthorHeader user={user} dateText={dateText} />

        <div className="px-4 pb-6 pt-4 text-[14px] font-normal leading-[200%] text-black sm:px-[50px] sm:pb-[40px] sm:pt-[157px]">
          <HtmlRenderer html={content} />
        </div>

        {isOwner ? (
          <div className="hidden justify-end gap-3 px-[50px] pb-[40px] sm:flex">
            <OwnerActions
              reviewId={reviewId}
              onDelete={onDelete}
              size="desktop"
            />
          </div>
        ) : null}

        {rejectReason ? (
          <div className="mx-4 mb-6 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-900 sm:mx-[50px]">
            반려 사유: {rejectReason}
          </div>
        ) : null}
      </div>
    </div>
  );
}
