import Link from "next/link";
import type { NavLinkItem } from "@/src/lib/navigation/nav-config";

interface FooterLinkColumnProps {
  title: string;
  links: NavLinkItem[];
}

function isExternalLink(href: string) {
  return href.startsWith("http") || href.startsWith("mailto:");
}

export function FooterLinkColumn({ title, links }: FooterLinkColumnProps) {
  return (
    <div className="flex flex-col items-start gap-3">
      <p className="text-sm font-semibold text-zinc-900">{title}</p>
      <nav className="flex flex-col items-start gap-2">
        {links.map(({ href, label }) =>
          isExternalLink(href) ? (
            <a
              key={href}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="text-sm text-zinc-500 transition hover:text-zinc-900"
            >
              {label}
            </a>
          ) : (
            <Link
              key={href}
              href={href}
              className="text-sm text-zinc-500 transition hover:text-zinc-900"
            >
              {label}
            </Link>
          )
        )}
      </nav>
    </div>
  );
}
