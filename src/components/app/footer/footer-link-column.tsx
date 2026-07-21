/** 푸터 링크 컬럼 UI */

import Link from "next/link";
import { externalLinkProps, isExternalLink } from "@/src/lib/navigation/link-utils";
import type { FooterLinkItem } from "./footer-config";

interface FooterLinkColumnProps {
  title: string;
  links: FooterLinkItem[];
}

function linkTextClassName(title: string, underline: boolean) {
  const sizeClass =
    title === "Policy"
      ? "text-[length:var(--footer-text-size-policy-link)]"
      : "text-[length:var(--footer-text-size-support-link)]";

  return [
    sizeClass,
    "font-medium leading-[var(--footer-line-height-primary)] tracking-[-0.005em] text-[var(--footer-text-link)] transition hover:text-[var(--footer-text-menu)]",
    underline
      ? "underline decoration-[var(--footer-text-link)] underline-offset-2 hover:decoration-[var(--footer-text-menu)]"
      : "no-underline sm:underline sm:decoration-[var(--footer-text-link)] sm:underline-offset-2 sm:hover:decoration-[var(--footer-text-menu)]",
  ].join(" ");
}

const iconLinkClassName = "group/icon inline-flex items-center";

function FooterLinkContent({ label, iconSrc }: Pick<FooterLinkItem, "label" | "iconSrc">) {
  if (iconSrc) {
    return (
      <span
        aria-hidden
        className="size-[17px] shrink-0 bg-[var(--footer-text-link)] transition group-hover/icon:bg-[var(--footer-text-menu)] sm:size-5 sm:translate-y-0.5 [mask-size:contain] [mask-repeat:no-repeat] [mask-position:left_center]"
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
    <div className="flex w-full flex-col sm:w-auto sm:gap-[var(--footer-gap-two-lines)]">
      <p className="m-0 pt-[11px] text-[length:var(--footer-text-size-menu)] font-semibold leading-[var(--footer-line-height-primary)] tracking-[-0.005em] text-[var(--footer-text-menu)] sm:pt-0">
        {title}
      </p>
      <nav className="m-0 flex flex-row flex-wrap items-center gap-x-[var(--footer-gap-link-items)] gap-y-1 sm:flex-col sm:items-start sm:gap-y-[var(--footer-gap-link-items)]">
        {links.map(({ href, label, iconSrc, underline = true }) => {
          const className = iconSrc
            ? iconLinkClassName
            : linkTextClassName(title, underline);
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
