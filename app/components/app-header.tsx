"use client";

import { useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useClickOutside } from "@/src/hooks/use-click-outside";
import {
  SITE_CONTAINER_PADDING_X,
} from "@/src/lib/layout/constants";
import { DesktopNav } from "./header/desktop-nav";
import { HamburgerButton } from "./header/hamburger-button";
import { HeaderLogo } from "./header/header-logo";
import { MobileNav } from "./header/mobile-nav";
import { ProfileMenu } from "./header/profile-menu";

export function AppHeader() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutside(menuRef, () => setMenuOpen(false), menuOpen);

  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <header className="relative z-50 w-full bg-white">
      <div
        className={`relative mx-auto w-full md:border-b md:border-[var(--color-divider)] ${SITE_CONTAINER_PADDING_X}`}
        style={{ maxWidth: "var(--layout-content-max-width)" }}
      >
        <div className="relative flex items-center justify-center pt-5 md:pt-6">
          <div
            className="absolute left-0 flex items-center sm:left-0 md:hidden"
            ref={menuRef}
          >
            <HamburgerButton
              isOpen={menuOpen}
              onToggle={() => setMenuOpen((prev) => !prev)}
            />
          </div>

          <HeaderLogo />

          <div className="absolute right-0 top-1/2 flex -translate-y-1/2 items-center sm:right-0">
            <ProfileMenu />
          </div>
        </div>

        <DesktopNav isAdmin={isAdmin} />
      </div>

      {menuOpen && (
        <MobileNav isAdmin={isAdmin} onNavigate={() => setMenuOpen(false)} />
      )}
    </header>
  );
}
