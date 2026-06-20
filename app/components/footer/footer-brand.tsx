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
      <p className="max-w-sm text-sm leading-relaxed text-zinc-500">{FOOTER_TAGLINE}</p>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-zinc-500">
        {firstLine}
        <br />
        {secondLine}
      </p>
      <p className="mt-8 text-xs text-zinc-400">{FOOTER_COPYRIGHT}</p>
      <p className="mt-2 text-xs text-zinc-400">{FOOTER_POWERED_BY}</p>
    </div>
  );
}
