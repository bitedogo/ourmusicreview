"use client";
/** 관리자 — 공개 사이트와 대시보드 전환 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

function isAuthPath(pathname: string) {
  return pathname === "/auth/signin" || pathname.startsWith("/auth/");
}

export function AdminSiteSwitcher() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  if (status !== "authenticated" || session?.user?.role !== "ADMIN") {
    return null;
  }

  if (isAuthPath(pathname)) {
    return null;
  }

  const onDashboard = pathname === "/admin" || pathname.startsWith("/admin/");
  const href = onDashboard ? "/" : "/admin";
  const label = onDashboard ? "GO WEBSITE" : "GO DASHBOARD";

  return (
    <div className="fixed right-4 z-[80] bottom-[max(1rem,env(safe-area-inset-bottom,0px))]">
      <Link
        href={href}
        className="inline-flex min-w-[9.5rem] items-center justify-center rounded-full bg-[var(--color-brand-primary)] px-4 py-2.5 text-xs font-semibold tracking-wide text-white shadow-lg transition hover:bg-[var(--color-brand-primary-hover)]"
      >
        {label}
      </Link>
    </div>
  );
}
