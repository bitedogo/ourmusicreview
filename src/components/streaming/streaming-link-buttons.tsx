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
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg transition hover:opacity-80"
        >
          <img
            src={platform.iconSrc}
            alt=""
            width={32}
            height={32}
            className="size-8 object-contain"
            loading="lazy"
            decoding="async"
          />
        </a>
      ))}
    </div>
  );
}
