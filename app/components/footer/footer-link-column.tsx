import Link from "next/link";
import { externalLinkProps, isExternalLink } from "@/src/lib/navigation/link-utils";
import type { NavLinkItem } from "@/src/lib/navigation/nav-config";

interface FooterLinkColumnProps {
  title: string;
  links: NavLinkItem[];
}

export function FooterLinkColumn({ title, links }: FooterLinkColumnProps) {
  return (
    <div className="flex flex-col items-start gap-[var(--featured-card-inner-gap)]">
      <p className="text-[length:var(--text-today-album-body-mobile)] font-semibold text-[var(--color-text-primary)]">
        {title}
      </p>
      <nav className="flex flex-col items-start gap-[var(--featured-card-inner-gap)]">
        {links.map(({ href, label }) =>
          isExternalLink(href) ? (
            <a
              key={href}
              href={href}
              {...externalLinkProps(href)}
              className="text-[length:var(--text-today-album-body-mobile)] text-[var(--color-text-secondary)] transition hover:text-[var(--color-text-primary)]"
            >
              {label}
            </a>
          ) : (
            <Link
              key={href}
              href={href}
              className="text-[length:var(--text-today-album-body-mobile)] text-[var(--color-text-secondary)] transition hover:text-[var(--color-text-primary)]"
            >
              {label}
            </Link>
          )
        )}
      </nav>
    </div>
  );
}
