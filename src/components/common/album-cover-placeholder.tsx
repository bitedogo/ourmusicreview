/** 브랜드 톤 앨범 커버 플레이스홀더 */

interface AlbumCoverPlaceholderProps {
  className?: string;
  label?: string;
}

export function AlbumCoverPlaceholder({
  className = "",
  label = "앨범 커버",
}: AlbumCoverPlaceholderProps) {
  return (
    <div
      className={`flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#EFFAF8] via-[#F4FBFA] to-[#E8F3F1] ${className}`.trim()}
      role="img"
      aria-label={label}
    >
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        aria-hidden
        className="text-[#43A7B2]/70"
      >
        <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="20" cy="20" r="6" fill="currentColor" fillOpacity="0.35" />
        <circle cx="20" cy="20" r="2" fill="currentColor" />
      </svg>
      <span className="mt-2 text-[10px] font-semibold tracking-[0.12em] text-[#43A7B2]/80">
        ORU
      </span>
    </div>
  );
}
