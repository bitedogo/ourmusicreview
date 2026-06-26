import Image from "next/image";
import type { AlbumStreamingLinks } from "@/src/lib/streaming/types";
import { getVisibleStreamingPlatforms } from "@/src/lib/streaming/platforms";

interface StreamingLinkButtonsProps {
  links: AlbumStreamingLinks | null | undefined;
  className?: string;
}

export function StreamingLinkButtons({ links, className = "" }: StreamingLinkButtonsProps) {
  const platforms = getVisibleStreamingPlatforms(links);
  if (platforms.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`.trim()}>
      {platforms.map((platform) => (
        <a
          key={platform.key}
          href={platform.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={platform.label}
          className="inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-full transition hover:opacity-80"
        >
          <Image
            src={platform.iconSrc}
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 object-cover"
          />
        </a>
      ))}
    </div>
  );
}
