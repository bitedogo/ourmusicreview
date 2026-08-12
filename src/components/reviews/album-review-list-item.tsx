"use client";
/** 앨범 상세 리뷰 목록용 카드 */

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getUserProfilePath } from "@/src/components/profile/user-profile-view";
import { reviewDetail } from "@/src/lib/navigation/routes";
import { formatDateYYYYMMDD } from "@/src/lib/utils/date";
import { getHtmlPlainText } from "@/src/lib/utils/editor";
import { formatRating, getRatingScoreColor } from "@/src/lib/utils/rating";

export interface AlbumReviewListItemData {
  id: string;
  content: string;
  rating: number;
  isApproved: "Y" | "N";
  createdAt: string;
  user: {
    id: string;
    nickname: string;
    profileImage: string | null;
  };
}

interface AlbumReviewListItemProps {
  review: AlbumReviewListItemData;
}

export function AlbumReviewListItem({ review }: AlbumReviewListItemProps) {
  const router = useRouter();
  const href = reviewDetail(review.id);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => router.push(href)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          router.push(href);
        }
      }}
      className="block cursor-pointer rounded-2xl border border-zinc-200 bg-white p-5 text-left shadow-sm transition hover:border-zinc-300 hover:shadow-md"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={getUserProfilePath(review.user.id)}
            onClick={(event) => event.stopPropagation()}
            className="shrink-0 rounded-full"
            aria-label={`${review.user.nickname} 프로필 보기`}
          >
            {review.user.profileImage ? (
              <Image
                src={review.user.profileImage}
                alt=""
                width={40}
                height={40}
                sizes="40px"
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-200 text-xs font-semibold text-[var(--color-text-secondary)]">
                {review.user.nickname.charAt(0).toUpperCase()}
              </div>
            )}
          </Link>
          <div>
            <Link
              href={getUserProfilePath(review.user.id)}
              onClick={(event) => event.stopPropagation()}
              className="text-sm font-semibold text-[var(--color-text-primary)] hover:underline"
            >
              {review.user.nickname}
            </Link>
            <p className="text-xs text-[var(--color-text-secondary)]">
              {formatDateYYYYMMDD(review.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-lg font-bold"
            style={{ color: getRatingScoreColor(review.rating) }}
          >
            {formatRating(review.rating)}
          </span>
          <span className="text-sm text-[var(--color-text-secondary)]">/ 10.0</span>
        </div>
      </div>

      <p className="line-clamp-3 text-sm text-[var(--color-text-primary)]">
        {getHtmlPlainText(review.content) || "내용 없음"}
      </p>

      {review.isApproved === "N" && (
        <div className="mt-3 rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-1.5 text-xs text-yellow-900">
          승인 대기 중
        </div>
      )}
    </div>
  );
}
