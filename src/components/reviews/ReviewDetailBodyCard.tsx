/** 리뷰 상세 — RATING·작성자·본문 카드 */

import Link from "next/link";
import Image from "next/image";
import { HtmlRenderer } from "@/src/components/common/HtmlRenderer";
import { getUserProfilePath } from "@/src/components/profile/user-profile-view";
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

function AuthorAvatar({
  user,
  sizeClass,
}: {
  user: ReviewDetailAuthor;
  sizeClass: string;
}) {
  return (
    <Link
      href={getUserProfilePath(user.id)}
      className={`${sizeClass} shrink-0 overflow-hidden rounded-full bg-[#D9D9D9]`}
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
    <div className="relative mt-[70px] w-full overflow-visible sm:mt-[50px]">
      <div className="relative w-full overflow-visible rounded-[15px] border border-[#D9D9D9] bg-white shadow-[0px_2px_4px_rgba(0,0,0,0.25)]">
        <div className="absolute left-1/2 top-[-40px] z-10 flex h-[110px] w-[110px] -translate-x-1/2 flex-col items-center justify-center rounded-[15px] border border-[#D9D9D9] bg-white shadow-[0px_2px_4px_#43A7B2] sm:left-[-23px] sm:top-[-20px] sm:h-[131px] sm:w-[131px] sm:translate-x-0">
          <span className="text-[18px] font-bold leading-[22px] tracking-[0.05em] text-[#43A7B2] sm:text-[24px] sm:leading-[29px]">
            RATING
          </span>
          <span
            className="text-[48px] font-bold leading-none sm:text-[64px] sm:leading-[76px]"
            style={{ color: ratingColor }}
          >
            {formatRating(ratingValue)}
          </span>
        </div>

        <div className="absolute left-[131px] top-[23px] z-[1] hidden items-center gap-[14px] sm:flex">
          <AuthorAvatar user={user} sizeClass="h-10 w-10" />
          <Link
            href={getUserProfilePath(user.id)}
            className="truncate text-[24px] font-medium leading-[29px] text-black hover:underline"
          >
            {user.nickname}
          </Link>
          <span className="shrink-0 text-[14px] font-normal leading-[17px] text-black">
            {formatDateYYYYMMDD(createdAt)}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-[12px] gap-y-[4px] px-4 pt-[80px] sm:hidden">
          <AuthorAvatar user={user} sizeClass="h-10 w-10" />
          <Link
            href={getUserProfilePath(user.id)}
            className="truncate text-[20px] font-medium leading-[29px] text-black hover:underline"
          >
            {user.nickname}
          </Link>
          <span className="text-[14px] font-normal leading-[17px] text-black">
            {formatDateYYYYMMDD(createdAt)}
          </span>
        </div>

        <div className="px-4 pb-6 pt-10 text-[14px] font-normal leading-[200%] text-black sm:px-[50px] sm:pb-[40px] sm:pt-[157px]">
          <HtmlRenderer html={content} />
        </div>

        {isOwner ? (
          <div className="flex justify-end gap-3 px-4 pb-6 sm:px-[50px] sm:pb-[40px] sm:pt-0">
            <Link
              href={`/review/${encodeURIComponent(reviewId)}/edit`}
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
