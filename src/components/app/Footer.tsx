/** 앱 전역 푸터 */

import { ContentContainer } from "@/src/lib/layout/content-container";
import { FooterBrand } from "./footer/footer-brand";
import { FOOTER_LINK_COLUMNS } from "./footer/footer-config";
import { FooterLinkColumn } from "./footer/footer-link-column";

export function Footer() {
  return (
    <footer className="mt-auto w-full bg-white sm:h-[var(--footer-height)]">
      <ContentContainer
        className="mx-auto flex h-full w-full items-start px-[var(--footer-padding-x)] pt-[var(--footer-padding-top)] pb-[var(--footer-padding-bottom)]"
      >
        <div className="flex w-full flex-col items-center gap-[var(--footer-gap-sections)] sm:grid sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:gap-0">
          <FooterBrand />

          <div className="flex w-full max-w-[var(--footer-brand-max-width)] flex-col gap-[var(--footer-gap-nav)] sm:w-auto sm:max-w-none sm:shrink-0 sm:flex-row sm:justify-start sm:justify-self-end sm:gap-x-[var(--footer-column-gap)] sm:gap-y-0">
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
