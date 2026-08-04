/** 푸터 브랜드·카피 */

import {
  FOOTER_COPYRIGHT,
  FOOTER_DESCRIPTION,
  FOOTER_POWERED_BY,
  FOOTER_TAGLINE,
} from "@/src/lib/site/copy";

const MOBILE_TEXT =
  "m-0 text-[11px] font-normal leading-[145%] tracking-[-0.005em] text-[var(--footer-text-brand)]";

const DESKTOP_TEXT =
  "m-0 max-w-[var(--footer-brand-max-width)] text-[length:var(--footer-text-size-primary)] font-medium leading-[var(--footer-line-height-primary)] tracking-[-0.005em] text-[var(--footer-text-brand)]";

const LEGAL_TEXT =
  "m-0 text-[length:var(--footer-text-size-secondary)] font-medium leading-[var(--footer-line-height-secondary)] tracking-[-0.005em] text-[var(--footer-text-brand)]";

function DescriptionLines({
  firstLine,
  secondLine,
  className,
}: {
  firstLine: string;
  secondLine: string;
  className: string;
}) {
  return (
    <p className={className}>
      {firstLine}
      <br />
      {secondLine}
    </p>
  );
}

export function FooterBrand() {
  const [firstLine, secondLine] = FOOTER_DESCRIPTION.split("\n");
  const description = { firstLine, secondLine };

  return (
    <>
      {/* 모바일 — 태그라인 + gap 13 + 설명 2줄 */}
      <div className="mx-auto flex w-full max-w-[var(--footer-brand-max-width)] flex-col gap-[var(--footer-gap-one-line)] sm:hidden">
        <p className={MOBILE_TEXT}>{FOOTER_TAGLINE}</p>
        <DescriptionLines {...description} className={MOBILE_TEXT} />
      </div>

      <div className="hidden min-w-0 flex-col gap-[var(--footer-gap-one-line)] sm:flex">
        <p className={DESKTOP_TEXT}>{FOOTER_TAGLINE}</p>
        <DescriptionLines {...description} className={DESKTOP_TEXT} />
        <div className="m-0 flex flex-col gap-[var(--footer-gap-legal-lines)]">
          <p className={LEGAL_TEXT}>{FOOTER_COPYRIGHT}</p>
          <p className={LEGAL_TEXT}>{FOOTER_POWERED_BY}</p>
        </div>
      </div>
    </>
  );
}
