/** 로그인 직후 역할에 따라 보낼 곳 */

import { redirect } from "next/navigation";
import { resolveLoginLandingUrl } from "@/src/lib/auth/callback-url";
import { getAppSession } from "@/src/lib/auth/session";

export default async function PostLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const session = await getAppSession();
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const params = await searchParams;
  const next = Array.isArray(params.next) ? params.next[0] : params.next;
  redirect(resolveLoginLandingUrl(session.user.role, next));
}
