/** 프로필 아바타 (균일 border 링) */

import Image from "next/image";
import Link from "next/link";

interface ProfileAvatarRingProps {
  size: 100 | 180;
  profileImage: string | null;
  nickname: string;
  href: string;
}

export function ProfileAvatarRing({
  size,
  profileImage,
  nickname,
  href,
}: ProfileAvatarRingProps) {
  const px = size === 180 ? 176 : 98;

  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-full border-2 border-[#43A7B2] bg-white shadow-[0px_2px_4px_rgba(0,0,0,0.25)] box-border"
      style={{ width: size, height: size }}
    >
      {profileImage ? (
        <Link href={href} className="block h-full w-full">
          <Image
            src={profileImage}
            alt={nickname}
            width={px}
            height={px}
            sizes={`${px}px`}
            className="h-full w-full object-cover"
          />
        </Link>
      ) : (
        <div
          className={`flex h-full w-full items-center justify-center font-bold text-[var(--color-text-muted)] ${
            size === 180 ? "text-sm" : "text-[10px]"
          }`}
        >
          No Image
        </div>
      )}
    </div>
  );
}
