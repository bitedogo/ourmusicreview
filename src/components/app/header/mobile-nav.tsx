/** 모바일 헤더 네비게이션 */

import Link from "next/link";
import { contentMaxWidthStyle } from "@/src/lib/layout";
import { NAV_LINKS } from "@/src/lib/navigation/nav-config";

interface MobileNavProps {
  onNavigate: () => void;
}

export function MobileNav({ onNavigate }: MobileNavProps) {
  return (
    <div className="absolute left-0 right-0 top-full z-40 bg-white shadow-lg md:hidden">
      <nav
        className="mx-auto w-full px-4 py-4 sm:px-0"
        style={contentMaxWidthStyle}
      >
        <ul className="space-y-1">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                onClick={onNavigate}
                className="block rounded-lg px-3 py-3 text-base font-medium text-[var(--color-text-primary)] transition-colors hover:bg-zinc-50 hover:text-[var(--color-accent)]"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
