/** 푸터 링크 컬럼 */

import Link from "next/link";
import { externalLinkProps, isExternalLink } from "@/src/lib/navigation/link-utils";
import type { FooterLinkItem } from "./footer-config";

interface FooterLinkColumnProps {
  title: string;
  links: FooterLinkItem[];
}

function linkTextClassName(underline: boolean) {
  const sizeClass = underline
    ? "text-[10px] sm:text-[16px]"
    : "text-[11px] sm:text-[16px]";

  return [
    "shrink-0 whitespace-nowrap font-medium leading-[145%] tracking-[-0.005em]",
    "text-[var(--footer-text-link)] transition hover:text-[var(--footer-text-menu)]",
    sizeClass,
    underline
      ? "underline decoration-[var(--footer-text-link)] underline-offset-2 hover:decoration-[var(--footer-text-menu)]"
      : "no-underline sm:underline sm:decoration-[var(--footer-text-link)] sm:underline-offset-2 sm:hover:decoration-[var(--footer-text-menu)]",
  ].join(" ");
}

function FooterLinkItemView({
  href,
  label,
  iconSrc,
  underline = true,
}: FooterLinkItem) {
  const className = iconSrc
    ? "group/icon inline-flex shrink-0 items-center"
    : linkTextClassName(underline);
  const ariaLabel = iconSrc ? label : undefined;

  const content = iconSrc ? (
    <span
      aria-hidden
      className="size-[17px] shrink-0 bg-[var(--footer-text-link)] transition group-hover/icon:bg-[var(--footer-text-menu)] sm:size-5 sm:translate-y-0.5 [mask-size:contain] [mask-repeat:no-repeat] [mask-position:left_center]"
      style={{
        maskImage: `url(${iconSrc})`,
        WebkitMaskImage: `url(${iconSrc})`,
      }}
    />
  ) : (
    label
  );

  if (isExternalLink(href)) {
    return (
      <a
        href={href}
        aria-label={ariaLabel}
        {...externalLinkProps(href)}
        className={className}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} aria-label={ariaLabel} className={className}>
      {content}
    </Link>
  );
}

const HEADER_CLASS =
  "m-0 box-border h-[27px] pt-[var(--footer-header-padding-top)] text-[13px] font-semibold leading-[16px] tracking-[-0.005em] text-[var(--footer-text-menu)] sm:h-auto sm:pt-0 sm:text-[16px] sm:leading-[145%]";

const LINKS_CLASS =
  "m-0 flex h-7 w-full flex-row flex-nowrap items-center gap-x-[var(--footer-gap-link-items)] sm:h-auto sm:flex-col sm:items-start sm:gap-y-[var(--footer-gap-link-items)]";

export function FooterLinkColumn({ title, links }: FooterLinkColumnProps) {
  return (
    <div className="flex flex-col sm:gap-[var(--footer-gap-two-lines)]">
      <p className={HEADER_CLASS}>{title}</p>
      <nav className={LINKS_CLASS}>
        {links.map((link) => (
          <FooterLinkItemView key={link.href} {...link} />
        ))}
      </nav>
    </div>
  );
}
