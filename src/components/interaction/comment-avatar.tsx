/** 댓글 아바타 — default / detail */

import Image from "next/image";
import Link from "next/link";
import type { CommentItemData } from "@/src/components/interaction/comment-types";
import { getUserProfilePath } from "@/src/components/profile/user-profile-view";

const AVATAR_SIZE = {
  detail: { px: 34, className: "h-[34px] w-[34px] shrink-0 overflow-hidden rounded-full bg-[#D9D9D9]" },
  default: { px: 32, className: "h-8 w-8 shrink-0 overflow-hidden rounded-full bg-zinc-100" },
} as const;

export function CommentAvatar({
  user,
  size,
}: {
  user: CommentItemData["user"];
  size: "detail" | "default";
}) {
  const { px, className } = AVATAR_SIZE[size];

  return (
    <Link
      href={getUserProfilePath(user.id)}
      className={className}
      aria-label={`${user.nickname} 프로필 보기`}
    >
      {user.profileImage ? (
        <Image
          src={user.profileImage}
          alt=""
          width={px}
          height={px}
          sizes={`${px}px`}
          className="h-full w-full object-cover"
        />
      ) : (
        <div
          className={`flex h-full w-full items-center justify-center font-semibold text-zinc-500 ${size === "detail" ? "text-[11px]" : "text-[10px] font-bold text-zinc-400"}`}
        >
          {user.nickname.charAt(0).toUpperCase()}
        </div>
      )}
    </Link>
  );
}
