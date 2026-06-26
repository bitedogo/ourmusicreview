import { ContentContainer } from "@/src/lib/layout/content-container";
import { SITE_CONTAINER_PADDING_X } from "@/src/lib/layout";
import { FooterBrand } from "./footer/footer-brand";
import { FOOTER_LINK_COLUMNS } from "./footer/footer-config";
import { FooterLinkColumn } from "./footer/footer-link-column";

export function Footer() {
  return (
    <footer className="mt-auto w-full bg-white">
      <ContentContainer
        className={`mx-auto w-full py-[var(--page-padding-x-mobile)] ${SITE_CONTAINER_PADDING_X} sm:py-[var(--today-album-content-padding-y-desktop)]`}
      >
        <div className="grid w-full grid-cols-1 items-start sm:grid-cols-[minmax(0,1fr)_auto]">
          <FooterBrand />

          <div className="flex shrink-0 justify-self-end gap-x-[var(--featured-card-inner-gap)] sm:gap-x-[var(--featured-card-gap)]">
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
