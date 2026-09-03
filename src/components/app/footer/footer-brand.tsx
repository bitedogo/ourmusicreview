/** 푸터 브랜드·카피 */

import {
  FOOTER_COPYRIGHT,
  FOOTER_DESCRIPTION,
  FOOTER_POWERED_BY,
  FOOTER_TAGLINE,
} from "@/src/lib/site/copy";

const BRAND_TEXT =
  "m-0 text-[11px] font-normal leading-[145%] tracking-[-0.005em] text-[var(--footer-text-brand)] sm:max-w-[var(--footer-brand-max-width)] sm:text-[length:var(--footer-text-size-primary)] sm:font-medium sm:leading-[var(--footer-line-height-primary)]";

const LEGAL_TEXT =
  "m-0 text-[length:var(--footer-text-size-secondary)] font-medium leading-[var(--footer-line-height-secondary)] tracking-[-0.005em] text-[var(--footer-text-brand)]";

function DescriptionLines({
  firstLine,
  secondLine,
}: {
  firstLine: string;
  secondLine: string;
}) {
  return (
    <p className={BRAND_TEXT}>
      {firstLine}
      <br />
      {secondLine}
    </p>
  );
}

export function FooterBrand() {
  const [firstLine, secondLine] = FOOTER_DESCRIPTION.split("\n");

  return (
    <div className="mx-auto flex w-full max-w-[var(--footer-brand-max-width)] flex-col gap-[var(--footer-gap-one-line)] sm:min-w-0 sm:max-w-none">
      <p className={BRAND_TEXT}>{FOOTER_TAGLINE}</p>
      <DescriptionLines firstLine={firstLine} secondLine={secondLine} />
      <div className="m-0 hidden flex-col gap-[var(--footer-gap-legal-lines)] sm:flex">
        <p className={LEGAL_TEXT}>{FOOTER_COPYRIGHT}</p>
        <p className={LEGAL_TEXT}>{FOOTER_POWERED_BY}</p>
      </div>
    </div>
  );
}
