import {
  FOOTER_COPYRIGHT,
  FOOTER_DESCRIPTION,
  FOOTER_POWERED_BY,
  FOOTER_TAGLINE,
} from "@/src/lib/site/copy";

export function FooterBrand() {
  const [firstLine, secondLine] = FOOTER_DESCRIPTION.split("\n");

  return (
    <div className="hidden min-w-0 flex-col gap-[var(--footer-gap-one-line)] sm:flex">
      <p className="m-0 max-w-[var(--footer-brand-max-width)] text-[length:var(--footer-text-size-primary)] leading-[var(--footer-line-height-primary)] text-[var(--footer-text-brand)]">
        {FOOTER_TAGLINE}
      </p>
      <p className="m-0 max-w-[var(--footer-brand-max-width)] text-[length:var(--footer-text-size-primary)] leading-[var(--footer-line-height-primary)] text-[var(--footer-text-brand)]">
        {firstLine}
        <br />
        {secondLine}
      </p>
      <div className="m-0 flex flex-col gap-[var(--footer-gap-legal-lines)] text-[length:var(--footer-text-size-secondary)] leading-[var(--footer-line-height-secondary)] text-[var(--footer-text-brand)]">
        <p className="m-0">{FOOTER_COPYRIGHT}</p>
        <p className="m-0">{FOOTER_POWERED_BY}</p>
      </div>
    </div>
  );
}
