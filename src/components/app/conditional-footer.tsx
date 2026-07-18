"use client";
/** 경로별 푸터 조건부 렌더 */

import { usePathname } from "next/navigation";
import { Footer } from "./Footer";

const HIDE_FOOTER_PATHS = ["/auth/signin"];

export function ConditionalFooter() {
  const pathname = usePathname();

  if (HIDE_FOOTER_PATHS.includes(pathname)) {
    return null;
  }

  return <Footer />;
}
