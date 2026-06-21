import {
  FOOTER_COPYRIGHT,
  FOOTER_DESCRIPTION,
  FOOTER_POWERED_BY,
  FOOTER_TAGLINE,
} from "@/src/lib/site/copy";

export function FooterBrand() {
  const [firstLine, secondLine] = FOOTER_DESCRIPTION.split("\n");

  return (
    <div className="hidden min-w-0 flex-col sm:flex">
      <p className="max-w-sm text-[length:var(--text-today-album-body-mobile)] leading-relaxed text-[var(--color-text-secondary)]">
        {FOOTER_TAGLINE}
      </p>
      <p className="mt-[var(--featured-card-inner-gap)] max-w-sm text-[length:var(--text-today-album-body-mobile)] leading-relaxed text-[var(--color-text-secondary)]">
        {firstLine}
        <br />
        {secondLine}
      </p>
      <p className="mt-[var(--featured-card-gap)] text-[length:var(--text-featured-meta)] text-[var(--color-text-muted)]">
        {FOOTER_COPYRIGHT}
      </p>
      <p className="mt-[var(--featured-card-inner-gap)] text-[length:var(--text-featured-meta)] text-[var(--color-text-muted)]">
        {FOOTER_POWERED_BY}
      </p>
    </div>
  );
}
