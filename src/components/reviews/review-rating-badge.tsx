/** 앨범 커버 좌하단 x.x / 10 레이팅 배지 */

import Image from "next/image";

export type ReviewRatingBadgeSize = "mobile" | "desktop";

const BADGE_BOX: Record<ReviewRatingBadgeSize, string> = {
  // 오버랩용 +1px — 커버 가장자리 AA 선 덮기
  mobile: "h-[29px] w-[53px]",
  desktop: "h-[43px] w-[70px]",
};

interface ReviewRatingBadgeProps {
  ratingText: string;
  ratingColor: string;
  size?: ReviewRatingBadgeSize;
}

/** 우상단 R만 있는 단일 흰색 배지 (좌·하단 1px 오버랩) */
export function ReviewRatingBadge({
  ratingText,
  ratingColor,
  size = "desktop",
}: ReviewRatingBadgeProps) {
  return (
    <div
      className={`pointer-events-none absolute -bottom-px -left-px z-[1] flex items-center justify-center rounded-tr-[10px] bg-white ${BADGE_BOX[size]}`}
    >
      <span className="inline-flex items-baseline font-bold leading-none tracking-[-0.005em]">
        <span
          className={size === "mobile" ? "text-[16px]" : "text-[20px]"}
          style={{ color: ratingColor }}
        >
          {ratingText}
        </span>
        <span
          className={
            size === "mobile"
              ? "text-[10px] tracking-normal text-[#C0C0C0]"
              : "text-[11px] tracking-normal text-[#C0C0C0]"
          }
        >
          {"\u00A0/\u00A0"}10
        </span>
      </span>
    </div>
  );
}

interface ReviewAlbumCoverProps {
  imageUrl: string | null;
  alt: string;
  width: number;
  height: number;
  className?: string;
  rating?: {
    text: string;
    color: string;
    size?: ReviewRatingBadgeSize;
  };
}

/**
 * 커버 + 배지.
 * 이미지만 안쪽에서 클립하고, 배지는 바깥에서 1px 오버랩해
 * 커버 가장자리 어두운 AA 헤어라인을 흰색으로 덮음.
 * (모바일 inset: 카드 흰 패딩 위로 살짝 나감 → 티 안 남)
 */
export function ReviewAlbumCover({
  imageUrl,
  alt,
  width,
  height,
  className = "",
  rating,
}: ReviewAlbumCoverProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 overflow-hidden rounded-[inherit]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={alt}
            width={width}
            height={height}
            unoptimized
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-zinc-100 text-[10px] text-zinc-400 sm:text-xs">
            No Image
          </div>
        )}
      </div>
      {rating ? (
        <ReviewRatingBadge
          ratingText={rating.text}
          ratingColor={rating.color}
          size={rating.size}
        />
      ) : null}
    </div>
  );
}
