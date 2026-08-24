"use client";
/** 앱 전역 헤더 */

import { useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useClickOutside } from "@/src/hooks/use-click-outside";
import { useUnreadNotificationCount } from "@/src/hooks/use-unread-notification-count";
import {
  SITE_CONTAINER_PADDING_X,
  contentMaxWidthStyle,
} from "@/src/lib/layout";
import { DesktopNav } from "./header/desktop-nav";
import { HamburgerButton } from "./header/hamburger-button";
import { HeaderLogo } from "./header/header-logo";
import { MobileNav } from "./header/mobile-nav";
import { ProfileMenu } from "./header/profile-menu";

export function AppHeader() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLElement>(null);
  const { unreadCount, setUnreadCount } = useUnreadNotificationCount();

  useClickOutside(menuRef, () => setMenuOpen(false), menuOpen);

  const isAdmin = session?.user?.role === "ADMIN";
  const showDesktopNav = pathname !== "/";

  return (
    <header className="relative z-50 w-full bg-white pt-[var(--safe-area-top)]" ref={menuRef}>
      <div
        className={`relative mx-auto w-full ${SITE_CONTAINER_PADDING_X}`}
        style={contentMaxWidthStyle}
      >
        <div className="pt-[var(--header-logo-padding-top)]">
          <div className="relative flex items-center justify-center">
            <div className="absolute left-0 top-1/2 flex -translate-y-1/2 md:hidden">
              <HamburgerButton
                isOpen={menuOpen}
                onToggle={() => setMenuOpen((prev) => !prev)}
              />
            </div>

            <HeaderLogo />

            <div className="absolute right-0 top-1/2 flex -translate-y-1/2">
              <ProfileMenu
                unreadCount={unreadCount}
                onUnreadCountChange={setUnreadCount}
              />
            </div>
          </div>
        </div>

        {showDesktopNav && <DesktopNav isAdmin={isAdmin} />}
      </div>

      {menuOpen && (
        <MobileNav isAdmin={isAdmin} onNavigate={() => setMenuOpen(false)} />
      )}
    </header>
  );
}
