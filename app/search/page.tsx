import { Suspense } from "react";
import { SearchClient } from "./search-client";

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-4xl px-6 py-10 text-sm text-zinc-500">검색 중...</div>}>
      <SearchClient />
    </Suspense>
  );
}

