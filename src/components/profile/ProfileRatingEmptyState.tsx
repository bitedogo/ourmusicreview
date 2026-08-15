/** Average Rating 빈 상태 */

interface ProfileRatingEmptyStateProps {
  className?: string;
}

export function ProfileRatingEmptyState({
  className = "",
}: ProfileRatingEmptyStateProps) {
  return (
    <div
      className={`flex w-full flex-1 items-center justify-center ${className}`}
      role="img"
      aria-label="Average Rating. Write Review, Light Rate"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/icons/profile-rating-empty.svg"
        alt="Average Rating — Write Review, Light Rate"
        width={575}
        height={378}
        draggable={false}
        className="h-auto w-full max-w-[575px] select-none"
      />
    </div>
  );
}
