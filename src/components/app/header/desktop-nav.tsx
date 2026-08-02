/** 데스크톱 헤더 네비게이션 */

import Link from "next/link";
import { ADMIN_LINKS, NAV_LINKS } from "@/src/lib/navigation/nav-config";
import { HeaderDropdownPanel } from "./header-dropdown-panel";

interface DesktopNavProps {
  isAdmin: boolean;
  className?: string;
}

const DEFAULT_NAV_CLASS =
  "relative z-50 mt-20 hidden items-center justify-center gap-14 pb-1 text-[length:var(--nav-menu-font-size)] font-medium leading-[145%] tracking-[var(--tracking-nav-menu)] text-[var(--color-nav-menu)] md:flex";

export function DesktopNav({ isAdmin, className }: DesktopNavProps) {
  return (
    <nav className={className ?? DEFAULT_NAV_CLASS}>
      {NAV_LINKS.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className="whitespace-nowrap transition-colors hover:text-[var(--color-accent)]"
        >
          {label}
        </Link>
      ))}
      {isAdmin && (
        <div className="group relative z-50 flex items-center">
          <span className="cursor-default transition-colors hover:text-[var(--color-accent)]">
            관리자
          </span>
          <div className="absolute left-1/2 top-full z-50 hidden -translate-x-1/2 pt-2 group-hover:block">
            <HeaderDropdownPanel className="min-w-[10rem]">
              {ADMIN_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="block w-full px-4 py-3 text-sm font-medium text-zinc-800 transition-colors hover:bg-zinc-50 hover:text-[var(--color-accent)]"
                >
                  {label}
                </Link>
              ))}
            </HeaderDropdownPanel>
          </div>
        </div>
      )}
    </nav>
  );
}
