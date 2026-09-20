/** 관리자 레이아웃·권한 가드·전용 셸 */

import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminShell } from "@/src/components/admin/shell/admin-shell";
import { requireAdminPage } from "@/src/lib/auth/session";

export const metadata: Metadata = {
  title: "관리자",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAdminPage();
  return <AdminShell>{children}</AdminShell>;
}
