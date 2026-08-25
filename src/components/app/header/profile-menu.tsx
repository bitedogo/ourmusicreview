"use client";
/** 헤더 프로필·계정 메뉴 */

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRef, useState, type Dispatch, type SetStateAction } from "react";
import { useClickOutside } from "@/src/hooks/use-click-outside";
import { AccountMenu } from "./account-menu";
import {
  AnnouncementInboxPanel,
  AnnouncementInboxTrigger,
} from "./announcement-inbox";
import { MailInboxPanel, MailInboxTrigger } from "./mail-inbox";
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
  const rootRef = useRef<HTMLDivElement>(null);

  useClickOutside(rootRef, () => setOpenMenu(null), openMenu !== null);

  function toggleMenu(menu: HeaderMenu) {
    setOpenMenu((current) => (current === menu ? null : menu));
  }

  if (status === "loading") {
    return <span className="text-xs text-[var(--color-text-muted)]">...</span>;
  }

  if (nickname) {
    return (
      <div className="relative flex items-center gap-3.5" ref={rootRef}>
        <AnnouncementInboxTrigger
          className="hidden md:block"
          unreadCount={announcementUnreadCount}
          isOpen={openMenu === "announcement"}
          onToggle={() => toggleMenu("announcement")}
        />
        <MailInboxTrigger
          className="hidden md:block"
          unreadCount={unreadCount}
          isOpen={openMenu === "mail"}
          onToggle={() => toggleMenu("mail")}
        />
        <AccountMenu
          nickname={nickname}
          profileImage={profileImage}
          isOpen={openMenu === "profile"}
          announcementUnreadCount={announcementUnreadCount}
          mailUnreadCount={unreadCount}
          onToggle={() => toggleMenu("profile")}
          onClose={() => setOpenMenu(null)}
          onOpenAnnouncement={() => setOpenMenu("announcement")}
          onOpenMail={() => setOpenMenu("mail")}
        />

        {openMenu === "announcement" ? (
          <AnnouncementInboxPanel
            onClose={() => setOpenMenu(null)}
            onUnreadCountChange={onAnnouncementUnreadCountChange}
          />
        ) : null}

        {openMenu === "mail" ? (
          <MailInboxPanel
            unreadCount={unreadCount}
            onClose={() => setOpenMenu(null)}
            onUnreadCountChange={onUnreadCountChange}
          />
        ) : null}
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
