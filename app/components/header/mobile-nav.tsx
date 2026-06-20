import Link from "next/link";
import { ADMIN_LINKS, NAV_LINKS } from "@/src/lib/navigation/nav-config";
import { HOME_CONTENT_MAX_WIDTH } from "@/src/lib/layout/constants";

interface MobileNavProps {
  isAdmin: boolean;
  onNavigate: () => void;
}

export function MobileNav({ isAdmin, onNavigate }: MobileNavProps) {
  return (
    <div className="absolute left-0 right-0 top-full z-40 bg-white shadow-lg md:hidden">
      <nav
        className="mx-auto w-full px-4 py-4 sm:px-0"
        style={{ maxWidth: HOME_CONTENT_MAX_WIDTH }}
      >
        <ul className="space-y-1">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                onClick={onNavigate}
                className="block rounded-lg px-3 py-3 text-base font-medium text-zinc-800 transition-colors hover:bg-zinc-50 hover:text-[var(--color-accent)]"
              >
                {label}
              </Link>
            </li>
          ))}
          {isAdmin && (
            <>
              <li className="mt-2 border-t border-zinc-100 pt-2">
                <span className="block px-3 py-1.5 text-sm font-bold uppercase tracking-wider text-zinc-400">
                  관리자
                </span>
              </li>
              {ADMIN_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={onNavigate}
                    className="block rounded-lg px-3 py-3 text-base font-medium text-zinc-800 transition-colors hover:bg-zinc-50 hover:text-[var(--color-accent)]"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </>
          )}
        </ul>
      </nav>
    </div>
  );
}
