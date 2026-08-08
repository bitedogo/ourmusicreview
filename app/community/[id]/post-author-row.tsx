import Image from "next/image";
import Link from "next/link";
import { getUserProfilePath } from "@/src/components/profile/user-profile-view";

interface PostAuthorRowProps {
  userId: string;
  nickname: string;
  profileImage: string | null;
  timeAgo: string;
  views: number;
  commentCount: number;
}

export function PostAuthorRow({
  userId,
  nickname,
  profileImage,
  timeAgo,
  views,
  commentCount,
}: PostAuthorRowProps) {
  const profileHref = getUserProfilePath(userId);

  return (
    <div className="flex items-center gap-3 border-b border-zinc-100 pb-4 pt-2">
      <Link
        href={profileHref}
        className="h-6 w-6 shrink-0 overflow-hidden rounded-md bg-zinc-100"
        aria-label={`${nickname} 프로필 보기`}
      >
        {profileImage ? (
          <Image
            src={profileImage}
            alt=""
            width={24}
            height={24}
            sizes="24px"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-[var(--color-text-muted)]">
            {nickname.charAt(0).toUpperCase()}
          </div>
        )}
      </Link>

      <div className="flex flex-wrap items-center gap-2 text-[13px] text-[var(--color-text-secondary)]">
        <Link href={profileHref} className="font-semibold text-[var(--color-text-primary)] hover:underline">
          {nickname}
        </Link>
        <span className="text-[var(--color-text-muted)]">|</span>
        <span>{timeAgo}</span>
        <span className="text-[var(--color-text-muted)]">|</span>
        <span>
          조회 수 <span className="text-[var(--color-text-primary)]">{views}</span>
        </span>
        <span className="text-[var(--color-text-muted)]">|</span>
        <span>
          댓글 <span className="font-medium text-red-500">{commentCount}</span>
        </span>
      </div>
    </div>
  );
}
