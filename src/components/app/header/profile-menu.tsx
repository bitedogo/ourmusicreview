"use client";
/** 헤더 프로필·계정 메뉴 */

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState, type Dispatch, type SetStateAction } from "react";
import { AccountMenu } from "./account-menu";
import { AnnouncementInbox } from "./announcement-inbox";
import { MailInbox } from "./mail-inbox";
import { UserOutlineIcon } from "./user-outline-icon";

type HeaderMenu = "announcement" | "mail" | "profile" | null;

interface ProfileMenuProps {
  unreadCount: number;
  onUnreadCountChange: Dispatch<SetStateAction<number>>;
  announcementUnreadCount: number;
  onAnnouncementUnreadCountChange: Dispatch<SetStateAction<number>>;
}

export function ProfileMenu({
  unreadCount,
  onUnreadCountChange,
  announcementUnreadCount,
  onAnnouncementUnreadCountChange,
}: ProfileMenuProps) {
  const { data: session, status } = useSession();
  const nickname = session?.user?.name ?? null;
  const profileImage =
    session?.user?.profileImage ?? session?.user?.image ?? null;
  const [openMenu, setOpenMenu] = useState<HeaderMenu>(null);

  function toggleMenu(menu: HeaderMenu) {
    setOpenMenu((current) => (current === menu ? null : menu));
  }

  if (status === "loading") {
    return <span className="text-xs text-[var(--color-text-muted)]">...</span>;
  }

  if (nickname) {
    return (
      <div className="flex items-center gap-3.5">
        <AnnouncementInbox
          isOpen={openMenu === "announcement"}
          unreadCount={announcementUnreadCount}
          onUnreadCountChange={onAnnouncementUnreadCountChange}
          onToggle={() => toggleMenu("announcement")}
          onClose={() => setOpenMenu(null)}
        />
        <MailInbox
          isOpen={openMenu === "mail"}
          unreadCount={unreadCount}
          onUnreadCountChange={onUnreadCountChange}
          onToggle={() => toggleMenu("mail")}
          onClose={() => setOpenMenu(null)}
        />
        <AccountMenu
          nickname={nickname}
          profileImage={profileImage}
          isOpen={openMenu === "profile"}
          onToggle={() => toggleMenu("profile")}
          onClose={() => setOpenMenu(null)}
        />
      </div>
    );
  }

  return (
    <Link
      href="/auth/signin"
      aria-label="로그인"
      className="flex items-center justify-center text-[var(--color-text-primary)] transition hover:text-[var(--color-accent)]"
    >
      <UserOutlineIcon />
    </Link>
  );
}
