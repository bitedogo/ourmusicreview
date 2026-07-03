import Link from "next/link";
import { externalLinkProps, isExternalLink } from "@/src/lib/navigation/link-utils";
import type { FooterLinkItem } from "./footer-config";

interface FooterLinkColumnProps {
  title: string;
  links: FooterLinkItem[];
}

const textLinkClassName =
  "text-[length:var(--footer-text-size-primary)] leading-[var(--footer-line-height-primary)] text-[var(--footer-text-link)] underline decoration-[var(--footer-text-link)] underline-offset-2 transition hover:text-[var(--footer-text-menu)] hover:decoration-[var(--footer-text-menu)]";

const iconLinkClassName =
  "group/icon inline-flex items-center";

function FooterLinkContent({ label, iconSrc }: Pick<FooterLinkItem, "label" | "iconSrc">) {
  if (iconSrc) {
    return (
      <span
        aria-hidden
        className="size-5 shrink-0 translate-y-0.5 bg-[var(--footer-text-link)] transition group-hover/icon:bg-[var(--footer-text-menu)] [mask-size:contain] [mask-repeat:no-repeat] [mask-position:left_center]"
        style={{
          maskImage: `url(${iconSrc})`,
          WebkitMaskImage: `url(${iconSrc})`,
        }}
      />
    );
  }

  return label;
}

export function FooterLinkColumn({ title, links }: FooterLinkColumnProps) {
  return (
    <div className="flex flex-col gap-[var(--footer-gap-two-lines)]">
      <p className="m-0 text-[length:var(--footer-text-size-primary)] font-semibold leading-[var(--footer-line-height-primary)] text-[var(--footer-text-menu)]">
        {title}
      </p>
      <nav className="m-0 flex flex-col gap-[var(--footer-gap-link-items)]">
        {links.map(({ href, label, iconSrc }) => {
          const className = iconSrc ? iconLinkClassName : textLinkClassName;
          const ariaLabel = iconSrc ? label : undefined;

          return isExternalLink(href) ? (
            <a
              key={href}
              href={href}
              aria-label={ariaLabel}
              {...externalLinkProps(href)}
              className={className}
            >
              <FooterLinkContent label={label} iconSrc={iconSrc} />
            </a>
          ) : (
            <Link key={href} href={href} aria-label={ariaLabel} className={className}>
              <FooterLinkContent label={label} iconSrc={iconSrc} />
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
