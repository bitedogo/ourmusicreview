"use client";
/** 경로별 푸터 조건부 렌더 */

import { usePathname } from "next/navigation";
import { Footer } from "./Footer";

function shouldHideAppChrome(pathname: string) {
  return (
    pathname === "/auth/signin" ||
    pathname === "/auth/post-login" ||
    pathname.startsWith("/admin")
  );
}

export function ConditionalFooter() {
  const pathname = usePathname();

  if (shouldHideAppChrome(pathname)) {
    return null;
  }

  return <Footer />;
}
