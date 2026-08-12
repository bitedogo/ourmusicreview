/** 검색 결과 서버 페이지 */

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { ContentContainer } from "@/src/lib/layout/content-container";
import { PAGE_PADDING_X } from "@/src/lib/layout";

const SearchClient = dynamic(() =>
  import("./search-client").then((mod) => mod.SearchClient)
);

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <ContentContainer
          className={`mx-auto w-full py-10 text-[length:var(--text-today-album-body-mobile)] text-[var(--color-text-secondary)] ${PAGE_PADDING_X}`}
        >
          검색 중...
        </ContentContainer>
      }
    >
      <SearchClient />
    </Suspense>
  );
}
