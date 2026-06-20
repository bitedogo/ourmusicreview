import Link from "next/link";
import { ADMIN_LINKS, NAV_LINKS } from "@/src/lib/navigation/nav-config";
import { HeaderDropdownPanel } from "./header-dropdown-panel";

interface DesktopNavProps {
  isAdmin: boolean;
}

export function DesktopNav({ isAdmin }: DesktopNavProps) {
  return (
    <nav className="mt-12 hidden items-center justify-center gap-8 pb-5 text-sm font-medium text-zinc-900 md:flex">
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
        <div className="group relative flex items-center">
          <span className="cursor-default transition-colors hover:text-[var(--color-accent)]">
            관리자
          </span>
          <div className="absolute left-1/2 top-full hidden -translate-x-1/2 pt-2 group-hover:block">
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
