/** 데스크톱 헤더 네비게이션 */

import Link from "next/link";
import { NAV_LINKS } from "@/src/lib/navigation/nav-config";

interface DesktopNavProps {
  className?: string;
}

const DEFAULT_NAV_CLASS =
  "relative mt-20 hidden items-center justify-center gap-14 pb-1 text-[length:var(--nav-menu-font-size)] font-medium leading-[145%] tracking-[var(--tracking-nav-menu)] text-[var(--color-nav-menu)] md:flex";

export function DesktopNav({ className }: DesktopNavProps) {
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
    </nav>
  );
}
