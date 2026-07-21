/** 푸터 브랜드·카피 */

import {
  FOOTER_COPYRIGHT,
  FOOTER_DESCRIPTION,
  FOOTER_POWERED_BY,
  FOOTER_TAGLINE,
} from "@/src/lib/site/copy";

export function FooterBrand() {
  const [firstLine, secondLine] = FOOTER_DESCRIPTION.split("\n");

  return (
    <div className="flex min-w-0 flex-col gap-[var(--footer-gap-one-line)]">
      <p className="m-0 max-w-[var(--footer-brand-max-width)] text-[length:var(--footer-text-size-primary)] font-medium leading-[var(--footer-line-height-primary)] tracking-[-0.005em] text-[var(--footer-text-brand)]">
        {FOOTER_TAGLINE}
      </p>
      <p className="m-0 max-w-[var(--footer-brand-max-width)] text-[length:var(--footer-text-size-primary)] font-medium leading-[var(--footer-line-height-primary)] tracking-[-0.005em] text-[var(--footer-text-brand)]">
        {firstLine}
        <br />
        {secondLine}
      </p>
      <div className="m-0 hidden flex-col gap-[var(--footer-gap-legal-lines)] text-[length:var(--footer-text-size-secondary)] font-medium leading-[var(--footer-line-height-secondary)] tracking-[-0.005em] text-[var(--footer-text-brand)] sm:flex">
        <p className="m-0">{FOOTER_COPYRIGHT}</p>
        <p className="m-0">{FOOTER_POWERED_BY}</p>
      </div>
    </div>
  );
}
