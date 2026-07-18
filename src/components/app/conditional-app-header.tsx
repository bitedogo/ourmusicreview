"use client";
/** 경로별 헤더 조건부 렌더 */

import { usePathname } from "next/navigation";
import { AppHeader } from "./app-header";

const HIDE_HEADER_PATHS = ["/auth/signin"];

export function ConditionalAppHeader() {
  const pathname = usePathname();

  if (HIDE_HEADER_PATHS.includes(pathname)) {
    return null;
  }

  return <AppHeader />;
}
