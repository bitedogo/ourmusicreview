/** 스트리밍 플랫폼 링크 버튼 */

import Image from "next/image";
import type { AlbumStreamingLinks } from "@/src/lib/streaming/types";
import { getVisibleStreamingPlatforms } from "@/src/lib/streaming/platforms";

interface StreamingLinkButtonsProps {
  links: AlbumStreamingLinks | null | undefined;
  className?: string;
  /** 댓글 곡 카드처럼 좁은 줄에서는 16px */
  size?: "default" | "compact";
}

export function StreamingLinkButtons({
  links,
  className = "",
  size = "default",
}: StreamingLinkButtonsProps) {
  const platforms = getVisibleStreamingPlatforms(links);
  if (platforms.length === 0) {
    return null;
  }

  const isCompact = size === "compact";

  return (
    <div
      className={`${
        isCompact
          ? "flex flex-wrap items-center gap-1"
          : "flex flex-wrap items-center gap-1.5 sm:gap-2"
      } ${className}`.trim()}
    >
      {platforms.map((platform) => (
        <a
          key={platform.key}
          href={platform.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={platform.label}
          className={
            isCompact
              ? "inline-flex size-4 shrink-0 items-center justify-center rounded transition hover:opacity-80"
              : "inline-flex size-6 shrink-0 items-center justify-center rounded-md transition hover:opacity-80 sm:size-8 sm:rounded-lg"
          }
        >
          <Image
            src={platform.iconSrc}
            alt=""
            width={32}
            height={32}
            className={
              isCompact ? "size-4 object-contain" : "size-6 object-contain sm:size-8"
            }
            unoptimized
          />
        </a>
      ))}
    </div>
  );
}
