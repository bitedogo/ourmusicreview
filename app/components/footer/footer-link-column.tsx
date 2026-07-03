import Link from "next/link";
import { externalLinkProps, isExternalLink } from "@/src/lib/navigation/link-utils";
import type { NavLinkItem } from "@/src/lib/navigation/nav-config";

interface FooterLinkColumnProps {
  title: string;
  links: NavLinkItem[];
}

export function FooterLinkColumn({ title, links }: FooterLinkColumnProps) {
  return (
    <div className="flex flex-col gap-[var(--footer-gap-two-lines)]">
      <p className="m-0 text-[length:var(--footer-text-size-primary)] font-semibold leading-[var(--footer-line-height-primary)] text-[var(--footer-text-menu)]">
        {title}
      </p>
      <nav className="m-0 flex flex-col gap-[var(--footer-gap-link-items)]">
        {links.map(({ href, label }) =>
          isExternalLink(href) ? (
            <a
              key={href}
              href={href}
              {...externalLinkProps(href)}
              className="text-[length:var(--footer-text-size-primary)] leading-[var(--footer-line-height-primary)] text-[var(--footer-text-link)] underline decoration-[var(--footer-text-link)] underline-offset-2 transition hover:text-[var(--footer-text-menu)] hover:decoration-[var(--footer-text-menu)]"
            >
              {label}
            </a>
          ) : (
            <Link
              key={href}
              href={href}
              className="text-[length:var(--footer-text-size-primary)] leading-[var(--footer-line-height-primary)] text-[var(--footer-text-link)] underline decoration-[var(--footer-text-link)] underline-offset-2 transition hover:text-[var(--footer-text-menu)] hover:decoration-[var(--footer-text-menu)]"
            >
              {label}
            </Link>
          )
        )}
      </nav>
    </div>
  );
}
