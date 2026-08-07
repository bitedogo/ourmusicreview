/** 플레이리스트 커버 — 슬리브 + 바이닐 (커버 이미지는 사각 슬리브에 표시) */

import Image from "next/image";

const SIZE_CLASS = {
  compact: "h-[75px] w-[106px]",
  list: "h-[70px]",
  sm: "h-12",
  md: "h-24 sm:h-28",
  lg: "h-36 sm:h-44",
} as const;

const FIXED_COVER_PX = 75;

const VINYL_BG = [
  "radial-gradient(circle at 50% 50%, #d8d8d8 0 7.5%, #1a1a1a 7.6% 8.8%, transparent 8.9%)",
  "repeating-radial-gradient(circle at 50% 50%, #0a0a0a 0 1px, #1c1c1c 1.5px 2.5px)",
  "conic-gradient(from 210deg at 50% 50%, transparent 0deg, rgba(255,255,255,0.14) 28deg, transparent 56deg, transparent 180deg, rgba(255,255,255,0.08) 208deg, transparent 236deg)",
  "radial-gradient(circle at 50% 50%, #111 0 100%)",
].join(", ");

export type PlaylistVinylCoverSize = keyof typeof SIZE_CLASS;

interface PlaylistVinylCoverProps {
  coverImageUrl: string | null | undefined;
  alt?: string;
  size?: PlaylistVinylCoverSize;
  className?: string;
  /** 호버 시 바이닐이 살짝 더 빠져나오게 */
  interactive?: boolean;
}

export function PlaylistVinylCover({
  coverImageUrl,
  alt = "",
  size = "md",
  className = "",
  interactive = false,
}: PlaylistVinylCoverProps) {
  const isFixed75 = size === "compact";
  const coverBoxClass = isFixed75
    ? "h-[75px] w-[75px]"
    : "aspect-square h-full";

  return (
    <div
      className={`group/vinyl relative shrink-0 ${
        isFixed75
          ? SIZE_CLASS.compact
          : `aspect-[1.42/1] ${SIZE_CLASS[size]}`
      } ${className}`}
    >
      {/* 바이닐 — 75×75 */}
      <div
        className={`absolute top-0 right-0 z-0 rounded-full shadow-[0_6px_14px_rgba(0,0,0,0.22)] transition-transform duration-500 ease-out ${coverBoxClass} ${
          interactive ? "group-hover/vinyl:translate-x-[6%]" : ""
        }`}
        style={{ background: VINYL_BG }}
        aria-hidden
      >
        <span className="absolute inset-[34%] rounded-full bg-[#cfcfcf] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)]" />
        <span className="absolute inset-[46%] rounded-full bg-[#1a1a1a]" />
      </div>

      {/* 슬리브 — 75×75 */}
      <div
        className={`absolute top-0 left-0 z-10 overflow-hidden bg-white shadow-[0_8px_18px_rgba(0,0,0,0.16)] ${coverBoxClass} relative`}
      >
        {coverImageUrl ? (
          <Image
            src={coverImageUrl}
            alt={alt}
            fill
            unoptimized
            className="object-cover"
            sizes={isFixed75 ? `${FIXED_COVER_PX}px` : "(max-width: 640px) 30vw, 180px"}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-zinc-100 text-[10px] text-zinc-400 sm:text-xs">
            No Cover
          </div>
        )}
      </div>
    </div>
  );
}
