import { ContentContainer } from "@/src/lib/layout/content-container";
import { PAGE_PADDING_X } from "@/src/lib/layout";
import { FooterBrand } from "./footer/footer-brand";
import { FOOTER_LINK_COLUMNS } from "./footer/footer-config";
import { FooterLinkColumn } from "./footer/footer-link-column";

export function Footer() {
  return (
    <footer className="mt-auto h-[var(--footer-height)] w-full bg-white">
      <ContentContainer
        className={`mx-auto flex h-full w-full items-start pt-[var(--footer-padding-top)] ${PAGE_PADDING_X}`}
      >
        <div className="grid w-full grid-cols-1 items-start sm:grid-cols-[minmax(0,1fr)_auto]">
          <FooterBrand />

          <div className="flex shrink-0 justify-center justify-self-center gap-x-[var(--footer-column-gap)] sm:justify-start sm:justify-self-end">
            {FOOTER_LINK_COLUMNS.map((column) => (
              <FooterLinkColumn
                key={column.title}
                title={column.title}
                links={column.links}
              />
            ))}
          </div>
        </div>
      </ContentContainer>
    </footer>
  );
}
