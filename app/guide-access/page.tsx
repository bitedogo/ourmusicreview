/** 디자이너·개발자 가이드 비밀번호 입력 */

import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { GuideAccessForm } from "./guide-access-form";
import {
  GUIDE_GATE_COOKIE,
  isGuideGateTokenValid,
  safeGuideNextPath,
} from "@/src/lib/guides/gate";

export const metadata: Metadata = {
  title: "가이드 입장",
  robots: { index: false, follow: false },
};

export default async function GuideAccessPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const nextPath = safeGuideNextPath(next);
  const token = (await cookies()).get(GUIDE_GATE_COOKIE)?.value;

  if (await isGuideGateTokenValid(token)) {
    redirect(nextPath);
  }

  return <GuideAccessForm nextPath={nextPath} />;
}
