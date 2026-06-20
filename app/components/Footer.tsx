import { ContentContainer } from "@/src/lib/layout/content-container";
import { FooterBrand } from "./footer/footer-brand";
import { FOOTER_LINK_COLUMNS } from "./footer/footer-config";
import { FooterLinkColumn } from "./footer/footer-link-column";

export function Footer() {
  return (
    <footer className="mt-auto w-full bg-white">
      <ContentContainer
        className={`mx-auto w-full border-t border-zinc-500 px-6 py-10 sm:px-0 sm:py-14`}
      >
        <div className="grid w-full grid-cols-1 items-start sm:grid-cols-[minmax(0,1fr)_auto]">
          <FooterBrand />

          <div className="flex shrink-0 justify-self-end gap-x-5 sm:gap-x-8">
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
