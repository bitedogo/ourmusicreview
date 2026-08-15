import { GuidePager } from "@/src/components/guides/guide-pager";
import type { DeveloperDocMeta } from "@/src/lib/developer/docs";

interface DocPagerProps {
  prev: DeveloperDocMeta | null;
  next: DeveloperDocMeta | null;
}

export function DocPager({ prev, next }: DocPagerProps) {
  return <GuidePager basePath="/developer" prev={prev} next={next} />;
}
