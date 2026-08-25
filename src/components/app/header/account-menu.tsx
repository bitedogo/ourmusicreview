"use client";
/** 헤더 계정 메뉴 */

import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { profileSelf } from "@/src/lib/navigation/routes";
import { HeaderDropdownPanel } from "./header-dropdown-panel";
import { HeaderIconButton } from "./header-icon-button";
import { UserOutlineIcon } from "./user-outline-icon";

interface AccountMenuProps {
  nickname: string;
  profileImage: string | null;
  isOpen: boolean;
  announcementUnreadCount: number;
  mailUnreadCount: number;
  onToggle: () => void;
  onClose: () => void;
  onOpenAnnouncement: () => void;
  onOpenMail: () => void;
}

function UnreadBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="ml-auto inline-flex min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-4 text-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function AccountMenu({
  nickname,
  profileImage,
  isOpen,
  announcementUnreadCount,
  mailUnreadCount,
  onToggle,
  onClose,
  onOpenAnnouncement,
  onOpenMail,
}: AccountMenuProps) {
  const mobileUnreadTotal = announcementUnreadCount + mailUnreadCount;

  return (
    <div className="relative">
      <HeaderIconButton label="프로필 메뉴" expanded={isOpen} onClick={onToggle}>
        {profileImage ? (
          <Image
            src={profileImage}
            alt={nickname}
            width={30}
            height={30}
            sizes="30px"
            className="h-[30px] w-[30px] rounded-full border border-zinc-300 object-cover"
          />
        ) : (
          <UserOutlineIcon />
        )}
        {mobileUnreadTotal > 0 ? (
          <span className="absolute -right-1 -top-1 inline-flex min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-4 text-white md:hidden">
            {mobileUnreadTotal > 99 ? "99+" : mobileUnreadTotal}
          </span>
        ) : null}
      </HeaderIconButton>

      {isOpen ? (
        <div className="absolute right-0 top-full z-50 mt-2 min-w-[9rem]">
          <HeaderDropdownPanel>
            <button
              type="button"
              onClick={onOpenAnnouncement}
              className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-[var(--color-text-primary)] hover:bg-zinc-50 md:hidden"
            >
              공지
              <UnreadBadge count={announcementUnreadCount} />
            </button>
            <button
              type="button"
              onClick={onOpenMail}
              className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-[var(--color-text-primary)] hover:bg-zinc-50 md:hidden"
            >
              알림
              <UnreadBadge count={mailUnreadCount} />
            </button>
            <Link
              href={profileSelf()}
              onClick={onClose}
              className="block w-full px-4 py-3 text-sm font-medium text-[var(--color-text-primary)] hover:bg-zinc-50"
            >
              마이페이지
            </Link>
            <button
              type="button"
              onClick={() => {
                onClose();
                void signOut({ callbackUrl: "/" });
              }}
              className="block w-full px-4 py-3 text-left text-sm font-medium text-[var(--color-text-primary)] hover:bg-zinc-50"
            >
              로그아웃
            </button>
          </HeaderDropdownPanel>
        </div>
      ) : null}
    </div>
  );
}
