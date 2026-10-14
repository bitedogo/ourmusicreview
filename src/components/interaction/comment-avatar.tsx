/** 댓글 아바타 */

import Image from "next/image";
import Link from "next/link";
import type { CommentItemData } from "@/src/components/interaction/comment-types";
import { COMMENT_DETAIL } from "@/src/components/interaction/comment-detail-styles";
import { getUserProfilePath } from "@/src/components/profile/user-profile-view";

const AVATAR_CLASS =
  "relative block h-[22.21px] w-[22.21px] shrink-0 overflow-hidden rounded-full bg-[#D9D9D9] sm:h-[34px] sm:w-[34px]";

export function CommentAvatar({
  user,
}: {
  user: CommentItemData["user"];
}) {
  const px = COMMENT_DETAIL.avatarDesktop;

  return (
    <Link
      href={getUserProfilePath(user.id)}
      className={AVATAR_CLASS}
      aria-label={`${user.nickname} 프로필 보기`}
    >
      {user.profileImage ? (
        <Image
          src={user.profileImage}
          alt=""
          width={px}
          height={px}
          sizes={`${px}px`}
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-full font-semibold text-[9px] text-[var(--color-text-secondary)] sm:text-[11px]">
          {user.nickname.charAt(0).toUpperCase()}
        </div>
      )}
    </Link>
  );
}
