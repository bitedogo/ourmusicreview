/** 리뷰 상세 — RATING·작성자·본문 카드 */

import Link from "next/link";
import Image from "next/image";
import { HtmlRenderer } from "@/src/components/common/HtmlRenderer";
import {
  REVIEW_BRAND_TEAL,
  REVIEW_CARD_SHELL_CLASS,
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

function AuthorAvatar({ user }: { user: ReviewDetailAuthor }) {
  return (
    <Link
      href={getUserProfilePath(user.id)}
      className="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-[#D9D9D9] sm:h-10 sm:w-10"
      aria-label={`${user.nickname} 프로필 보기`}
    >
      {user.profileImage ? (
        <Image
          src={user.profileImage}
          alt=""
          width={40}
          height={40}
          sizes="40px"
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-zinc-600">
          {user.nickname.charAt(0).toUpperCase()}
        </div>
      )}
    </Link>
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

  return (
    /* 앨범 카드 ↔ RATING 상단 30px: mt - |top| = 30 */
    <div className="relative mt-[50px] w-full overflow-visible">
      <div
        className={`relative w-full overflow-visible ${REVIEW_CARD_SHELL_CLASS}`}
      >
        {/* RATING — 모바일/데스크톱 모두 좌상단 걸침 + 옆에 작성자 */}
        <div
          className="absolute left-[-12px] top-[-20px] z-10 flex h-[96px] w-[96px] flex-col items-center justify-center rounded-[15px] border bg-white sm:left-[-23px] sm:h-[131px] sm:w-[131px]"
          style={{
            borderColor: `color-mix(in srgb, ${ratingColor} 45%, white)`,
            boxShadow: `0px 2px 4px color-mix(in srgb, ${ratingColor} 35%, transparent)`,
          }}
        >
          <span
            className="text-[14px] font-bold leading-[17px] tracking-[0.05em] sm:text-[24px] sm:leading-[29px]"
            style={{ color: REVIEW_BRAND_TEAL }}
          >
            RATING
          </span>
          <span
            className="text-[36px] font-bold leading-none sm:text-[64px] sm:leading-[76px]"
            style={{ color: ratingColor }}
          >
            {formatRating(ratingValue)}
          </span>
        </div>

        <div className="absolute left-[96px] right-3 top-[18px] z-[1] flex min-w-0 items-center gap-[10px] sm:left-[131px] sm:right-auto sm:top-[23px] sm:gap-[14px]">
          <AuthorAvatar user={user} />
          <Link
            href={getUserProfilePath(user.id)}
            className="min-w-0 truncate text-[16px] font-medium leading-[20px] text-black hover:underline sm:text-[24px] sm:leading-[29px]"
          >
            {user.nickname}
          </Link>
          <span className="shrink-0 text-[12px] font-normal leading-[15px] text-black sm:text-[14px] sm:leading-[17px]">
            {formatDateYYYYMMDD(createdAt)}
          </span>
        </div>

        <div className="px-4 pb-6 pt-[110px] text-[14px] font-normal leading-[200%] text-black sm:px-[50px] sm:pb-[40px] sm:pt-[157px]">
          <HtmlRenderer html={content} />
        </div>

        {isOwner ? (
          <div className="flex justify-end gap-3 px-4 pb-6 sm:px-[50px] sm:pb-[40px] sm:pt-0">
            <Link
              href={reviewEdit(reviewId)}
              className="text-xs font-medium text-zinc-400 transition-colors hover:text-[var(--color-brand-primary)]"
            >
              수정
            </Link>
            <button
              type="button"
              onClick={onDelete}
              className="text-xs font-medium text-zinc-400 transition-colors hover:text-[var(--color-brand-primary)]"
            >
              삭제
            </button>
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
