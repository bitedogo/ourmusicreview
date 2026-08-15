/** 디자이너 가이드 레이아웃 — 검색엔진 색인 제외 */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "디자이너 가이드",
  robots: { index: false, follow: false },
};

export default function DesignerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
