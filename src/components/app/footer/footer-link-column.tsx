/** 푸터 링크 컬럼 — 모바일 Nav: Header·Column 형제 (gap 3) */

import Link from "next/link";
import { externalLinkProps, isExternalLink } from "@/src/lib/navigation/link-utils";
import type { FooterLinkItem } from "./footer-config";

interface FooterLinkColumnProps {
  title: string;
  links: FooterLinkItem[];
}

/**
 * font-size는 반드시 완성된 리터럴 클래스만 사용.
 * `text-[length:var(${x})]` 처럼 동적 조합하면 Tailwind가 purge해서
 * 크기가 빠지고 브라우저 기본 16px로 커짐.
 */
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

function FooterLinks({
  links,
  className,
}: {
  links: FooterLinkItem[];
  className: string;
}) {
  return (
    <nav className={className}>
      {links.map((link) => (
        <FooterLinkItemView key={link.href} {...link} />
      ))}
    </nav>
  );
}

const MOBILE_HEADER_CLASS =
  "m-0 box-border h-[27px] pt-[var(--footer-header-padding-top)] text-[13px] font-semibold leading-[16px] tracking-[-0.005em] text-[var(--footer-text-menu)] sm:hidden";

const MOBILE_LINKS_CLASS =
  "m-0 flex h-7 w-full flex-row flex-nowrap items-center gap-x-[var(--footer-gap-link-items)] sm:hidden";

const DESKTOP_COLUMN_CLASS =
  "hidden sm:flex sm:w-auto sm:flex-col sm:gap-[var(--footer-gap-two-lines)]";

const DESKTOP_HEADER_CLASS =
  "m-0 text-[16px] font-semibold leading-[145%] tracking-[-0.005em] text-[var(--footer-text-menu)]";

const DESKTOP_LINKS_CLASS =
  "m-0 flex flex-col items-start gap-y-[var(--footer-gap-link-items)]";

export function FooterLinkColumn({ title, links }: FooterLinkColumnProps) {
  return (
    <>
      <p className={MOBILE_HEADER_CLASS}>{title}</p>
      <FooterLinks links={links} className={MOBILE_LINKS_CLASS} />

      <div className={DESKTOP_COLUMN_CLASS}>
        <p className={DESKTOP_HEADER_CLASS}>{title}</p>
        <FooterLinks links={links} className={DESKTOP_LINKS_CLASS} />
      </div>
    </>
  );
}
