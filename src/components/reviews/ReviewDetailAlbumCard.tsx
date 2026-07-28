/** 리뷰 상세·앨범 리뷰 — 앨범 정보 카드 (Figma Rectangle 77 / 800×160) */

import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatAlbumReleaseDate } from "@/src/lib/utils/date";
import { formatRating, getRatingScoreColor } from "@/src/lib/utils/rating";

export interface ReviewDetailAlbum {
  albumId: string;
  title: string;
  artist: string;
  imageUrl: string | null;
  genre: string | null;
  releaseDate: string | null;
}

interface ReviewDetailAlbumCardProps {
  album: ReviewDetailAlbum;
  averageRating: number | null;
  /** false면 More Review 숨김 (앨범 리뷰 목록 페이지용) */
  showMoreReview?: boolean;
  /** More Review 대신 우하단 액션 (스트리밍 링크 등) */
  footerAction?: ReactNode;
}

export function ReviewDetailAlbumCard({
  album,
  averageRating,
  showMoreReview = true,
  footerAction,
}: ReviewDetailAlbumCardProps) {
  const genreLabel = album.genre?.trim() || "장르 정보 없음";
  const releaseLabel = `발매일 ${formatAlbumReleaseDate(album.releaseDate)}`;
  const averageColor = getRatingScoreColor(averageRating);
  const moreHref = `/review/album/${encodeURIComponent(album.albumId)}`;

  return (
    <>
      {/* 데스크톱 — SVG 808×168 (카드 800×160) */}
      <div className="relative hidden h-[160px] w-full overflow-hidden rounded-[15px] border border-[#D9D9D9] bg-white shadow-[0px_2px_4px_rgba(0,0,0,0.25)] sm:block">
        {album.imageUrl ? (
          <Image
            src={album.imageUrl}
            alt={album.title}
            width={150}
            height={148}
            unoptimized
            className="absolute left-[6.5px] top-[6px] h-[148px] w-[150px] rounded-[10px] object-cover"
          />
        ) : (
          <div className="absolute left-[6.5px] top-[6px] h-[148px] w-[150px] rounded-[10px] bg-[#D9D9D9]" />
        )}

        <h2 className="absolute left-[172.5px] right-[190px] top-[19px] truncate text-[24px] font-medium leading-[29px] text-black">
          {album.title}
        </h2>
        <p className="absolute left-[172.5px] right-[190px] top-[47px] truncate text-[16px] font-normal leading-[19px] text-black">
          {album.artist}
        </p>
        <p className="absolute left-[172.5px] top-[93px] text-[14px] font-normal leading-[17px] text-black">
          {releaseLabel}
        </p>
        <p className="absolute left-[172.5px] top-[125px] text-[14px] font-normal leading-[17px] text-black">
          {genreLabel}
        </p>

        <div className="absolute right-[11px] top-[19px] flex items-baseline gap-[7px]">
          <span className="text-[16px] font-medium leading-[19px] text-[#43A7B2]">
            Average Rating
          </span>
          <span
            className="text-[24px] font-bold leading-[29px]"
            style={{ color: averageColor }}
          >
            {formatRating(averageRating)}
          </span>
        </div>

        {showMoreReview ? (
          <Link
            href={moreHref}
            className="absolute left-[689px] top-[118px] flex h-[30px] w-[100px] items-center justify-center rounded-[10px] bg-[#43A7B2] text-[13px] font-normal leading-[16px] text-white transition hover:bg-[var(--color-brand-primary-hover)]"
          >
            More Review
          </Link>
        ) : footerAction ? (
          <div className="absolute bottom-[12px] right-[11px]">{footerAction}</div>
        ) : null}
      </div>

      {/* 모바일 */}
      <div className="relative block w-full rounded-[15px] border border-[#D9D9D9] bg-white p-[10px] shadow-[0px_2px_4px_rgba(0,0,0,0.25)] sm:hidden">
        <div className="flex gap-[12px]">
          {album.imageUrl ? (
            <Image
              src={album.imageUrl}
              alt={album.title}
              width={100}
              height={100}
              unoptimized
              className="h-[100px] w-[100px] shrink-0 rounded-[10px] object-cover"
            />
          ) : (
            <div className="h-[100px] w-[100px] shrink-0 rounded-[10px] bg-[#D9D9D9]" />
          )}
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-[18px] font-medium leading-[22px] text-black">
                  {album.title}
                </h2>
                <p className="truncate text-[13px] font-normal text-black">
                  {album.artist}
                </p>
              </div>
              <div className="flex shrink-0 items-baseline gap-[4px] pt-[2px]">
                <span className="text-[11px] font-medium text-[#43A7B2]">
                  Average Rating
                </span>
                <span
                  className="text-[16px] font-bold leading-none"
                  style={{ color: averageColor }}
                >
                  {formatRating(averageRating)}
                </span>
              </div>
            </div>
            <p className="mt-[6px] text-[12px] text-black">{releaseLabel}</p>
            <p className="text-[12px] text-black">{genreLabel}</p>
            <div className="mt-auto flex justify-end pt-2">
              {showMoreReview ? (
                <Link
                  href={moreHref}
                  className="inline-flex h-[28px] items-center rounded-[10px] bg-[#43A7B2] px-3 text-[12px] text-white"
                >
                  More Review
                </Link>
              ) : (
                footerAction
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
