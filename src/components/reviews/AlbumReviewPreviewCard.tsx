/** 앨범 리뷰 목록 미리보기 카드 (Figma Group 103 / Rectangle 77) */

import Link from "next/link";
import Image from "next/image";
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

function formatCardDate(dateInput: string | Date): string {
  try {
    const d = new Date(dateInput);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}. ${m}. ${day}`;
  } catch {
    return String(dateInput);
  }
}

function LikeBadge({ count }: { count: number }) {
  return (
    <span className="inline-flex items-center gap-[7px]">
      <LikeIcon />
      <span className="text-[13px] font-normal leading-[17px] text-black sm:text-[14px]">
        {count}
      </span>
    </span>
  );
}

function RatingBadge({
  ratingText,
  ratingColor,
  size = "desktop",
  className = "",
}: {
  ratingText: string;
  ratingColor: string;
  size?: "mobile" | "desktop";
  className?: string;
}) {
  const isMobile = size === "mobile";
  return (
    <div
      className={`absolute bottom-0 left-0 flex items-center justify-center rounded-tr-[10px] bg-white ${
        isMobile ? "h-[28px] w-[52px]" : "h-[42px] w-[70px]"
      } ${className}`}
    >
      <span className="inline-flex items-baseline font-bold leading-none tracking-[-0.005em]">
        <span
          className="text-[20px]"
          style={{ color: ratingColor }}
        >
          {ratingText}
        </span>
        <span className="text-[11px] text-[#C0C0C0]"> /10</span>
      </span>
    </div>
  );
}

function LikeIcon() {
  return (
    <svg
      width="21"
      height="18"
      viewBox="0 0 21 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className="block"
    >
      <path
        d="M13.4395 1.10547C14.4137 0.494364 15.5099 0.370369 16.5508 0.624023C18.6536 1.13673 20.5 3.18567 20.5 5.80566C20.5 7.10358 19.9675 8.48679 19.1006 9.85645C18.2368 11.2211 17.0649 12.535 15.8447 13.6836C14.6259 14.831 13.3714 15.8018 12.3545 16.4834C11.8455 16.8246 11.4021 17.0888 11.0576 17.2656C10.8852 17.3541 10.7448 17.4175 10.6377 17.457C10.5174 17.5014 10.4808 17.5 10.5 17.5C10.5192 17.5 10.4826 17.5014 10.3623 17.457C10.2552 17.4175 10.1148 17.3541 9.94238 17.2656C9.59787 17.0888 9.15449 16.8246 8.64551 16.4834C7.62864 15.8018 6.37414 14.831 5.15527 13.6836C3.93515 12.535 2.76322 11.2211 1.89941 9.85645C1.03252 8.48679 0.5 7.10358 0.5 5.80566C0.500011 3.17454 2.26963 1.1628 4.31738 0.666992C5.33317 0.421104 6.42118 0.546614 7.41699 1.15723C8.41559 1.76968 9.36062 2.89515 10.0312 4.71387L10.5352 6.08105L10.9766 4.69238C11.5622 2.84988 12.4632 1.71791 13.4395 1.10547Z"
        stroke="#C0C0C0"
      />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className="block"
    >
      <path
        d="M9.5 0.5C14.4703 0.500131 18.5 4.52952 18.5 9.5C18.5 10.4366 18.3553 11.3394 18.0898 12.1885L19.1426 18.5L13.7686 17.4248C12.4984 18.1105 11.0447 18.5 9.5 18.5C4.52957 18.5 0.5 14.4706 0.5 9.5C0.5 4.52944 4.52957 0.5 9.5 0.5Z"
        fill="white"
      />
      <path
        d="M9.5 0.5L9.50001 0H9.5V0.5ZM18.0898 12.1885L17.6126 12.0393L17.577 12.1531L17.5967 12.2707L18.0898 12.1885ZM19.1426 18.5L19.0445 18.9903L19.755 19.1324L19.6358 18.4177L19.1426 18.5ZM13.7686 17.4248L13.8666 16.9345L13.6898 16.8991L13.531 16.9848L13.7686 17.4248ZM9.5 18.5V19H9.50001L9.5 18.5ZM9.5 0.5L9.49999 1C14.1942 1.00012 18 4.80568 18 9.5H18.5H19C19 4.25336 14.7464 0.000138193 9.50001 0L9.5 0.5ZM18.5 9.5H18C18 10.3848 17.8633 11.2373 17.6126 12.0393L18.0898 12.1885L18.5671 12.3377C18.8473 11.4414 19 10.4884 19 9.5H18.5ZM18.0898 12.1885L17.5967 12.2707L18.6494 18.5823L19.1426 18.5L19.6358 18.4177L18.583 12.1062L18.0898 12.1885ZM19.1426 18.5L19.2407 18.0097L13.8666 16.9345L13.7686 17.4248L13.6705 17.9151L19.0445 18.9903L19.1426 18.5ZM13.7686 17.4248L13.531 16.9848C12.3319 17.6321 10.9597 18 9.49999 18L9.5 18.5L9.50001 19C11.1297 19 12.6648 18.5889 14.0061 17.8648L13.7686 17.4248ZM9.5 18.5V18C4.80571 18 1 14.1944 1 9.5H0.5H0C0 14.7467 4.25343 19 9.5 19V18.5ZM0.5 9.5H1C1 4.80558 4.80571 1 9.5 1V0.5V0C4.25343 0 0 4.25329 0 9.5H0.5Z"
        fill="#C0C0C0"
      />
    </svg>
  );
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
  const dateText = formatCardDate(createdAt);
  const author = authorNickname ?? "익명";

  return (
    <Link
      href={href}
      className="relative mx-auto block w-full max-w-[800px] transition hover:opacity-[0.98]"
    >
      {/* 모바일 */}
      <article className="relative box-border flex min-h-[120px] w-full gap-3 rounded-[15px] border border-[#D9D9D9] bg-white p-3 shadow-[0px_2px_4px_rgba(0,0,0,0.25)] sm:hidden">
        <div className="relative h-[96px] w-[96px] shrink-0 overflow-hidden rounded-tl-[10px] rounded-tr-[10px] rounded-br-[10px] rounded-bl-none bg-zinc-100">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={albumTitle}
              width={96}
              height={96}
              unoptimized
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] text-zinc-400">
              No Image
            </div>
          )}
          <RatingBadge
            ratingText={ratingText}
            ratingColor={ratingColor}
            size="mobile"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-[16px] font-medium leading-[20px] text-black">
                {albumTitle}
              </h3>
              <p className="truncate text-[13px] font-normal leading-[16px] text-black">
                {artist}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <LikeBadge count={likeCount} />
              <span className="inline-flex items-center gap-1">
                <CommentIcon />
                <span className="text-[13px] text-black">{commentCount}</span>
              </span>
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

      {/*
        데스크톱 — Figma 제목 없는 카드 좌표 (프레임 top 20 보정)
        album 19 / artist 47 / preview 86 / meta 120 / likes 29
      */}
      <article className="relative hidden h-[160px] w-full overflow-hidden rounded-[15px] border border-[#D9D9D9] bg-white shadow-[0px_2px_4px_rgba(0,0,0,0.25)] sm:block">
        <div className="absolute left-[7px] top-[6px] h-[148px] w-[150px] overflow-hidden rounded-tl-[10px] rounded-tr-[10px] rounded-br-[10px] rounded-bl-none bg-zinc-100">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={albumTitle}
              width={150}
              height={148}
              unoptimized
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">
              No Image
            </div>
          )}
        </div>

        {/* 커버 inset(7px)·하단 여백과 배지 사이 이음새(회색 경계) 가림 */}
        <div
          className="pointer-events-none absolute left-0 top-[112px] z-10 h-[48px] w-[8px] bg-white"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-0 left-0 z-10 h-[7px] w-[76px] bg-white"
          aria-hidden
        />

        <RatingBadge
          ratingText={ratingText}
          ratingColor={ratingColor}
          className="left-[6px] top-[112px] bottom-auto z-20"
        />

        <h3 className="absolute left-[173px] right-[120px] top-[19px] truncate text-[24px] font-medium leading-[29px] text-black">
          {albumTitle}
        </h3>

        <p className="absolute left-[173px] right-[120px] top-[47px] truncate text-[16px] font-normal leading-[19px] text-black">
          {artist}
        </p>

        <div className="absolute right-[37px] top-[29px] flex items-center gap-[10px]">
          <LikeBadge count={likeCount} />
          <span className="inline-flex items-center gap-[7px]">
            <CommentIcon />
            <span className="text-[14px] font-normal leading-[17px] text-black">
              {commentCount}
            </span>
          </span>
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
      </article>
    </Link>
  );
}
