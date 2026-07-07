"use client";

import Link from "next/link";
import Image from "next/image";
import { ProfileReviewItem } from "./profile-types";

interface ProfileReviewRowProps {
  review: ProfileReviewItem;
  onNavigate?: () => void;
}

export function ProfileReviewRow({ review, onNavigate }: ProfileReviewRowProps) {
  return (
    <div>
      <Link
        href={`/review/${encodeURIComponent(review.id)}`}
        onClick={onNavigate}
        className="flex items-center space-x-3 rounded-lg py-1 transition hover:bg-zinc-50"
      >
        {review.album?.imageUrl ? (
          <Image
            src={review.album.imageUrl}
            alt={review.album.title}
            width={40}
            height={40}
            className="rounded-md object-cover"
          />
        ) : null}
        <div className="min-w-0 flex-1 text-left">
          <p className="text-sm font-medium text-gray-900">{review.album?.title ?? "앨범"}</p>
          <p className="text-xs text-gray-500">
            {review.album?.artist ?? "-"} - 평점: {review.rating}
          </p>
        </div>
      </Link>
    </div>
  );
}
