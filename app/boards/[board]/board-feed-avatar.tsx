/** 게시판 피드 원형 아바타 */

import Image from "next/image";
import Link from "next/link";
import { getUserProfilePath } from "@/src/components/profile/user-profile-view";

interface BoardFeedAvatarProps {
  userId?: string | null;
  nickname: string;
  profileImage: string | null;
}

export function BoardFeedAvatar({
  userId,
  nickname,
  profileImage,
}: BoardFeedAvatarProps) {
  const initial = nickname.trim().charAt(0).toUpperCase() || "?";
  const face = profileImage ? (
    <Image
      src={profileImage}
      alt=""
      width={36}
      height={36}
      sizes="36px"
      className="h-full w-full object-cover"
    />
  ) : (
    <span className="flex h-full w-full items-center justify-center text-[11px] font-semibold text-[var(--color-text-secondary)]">
      {initial}
    </span>
  );

  const className = "relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-zinc-200";

  if (userId) {
    return (
      <Link
        href={getUserProfilePath(userId)}
        className={className}
        aria-label={`${nickname} 프로필 보기`}
      >
        {face}
      </Link>
    );
  }

  return (
    <div className={className} aria-hidden="true">
      {face}
    </div>
  );
}
