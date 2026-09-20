"use client";
/** 경로별 헤더 조건부 렌더 */

import { usePathname } from "next/navigation";
import { AppHeader } from "./app-header";

function shouldHideAppChrome(pathname: string) {
  return (
    pathname === "/auth/signin" ||
    pathname === "/auth/post-login" ||
    pathname.startsWith("/admin")
  );
}

export function ConditionalAppHeader() {
  const pathname = usePathname();

  if (shouldHideAppChrome(pathname)) {
    return null;
  }

  return <AppHeader />;
}
