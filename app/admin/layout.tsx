import type { ReactNode } from "react";
import { requireAdminPage } from "@/src/lib/auth/session";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAdminPage();
  return children;
}
