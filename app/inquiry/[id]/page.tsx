/** 문의 상세 페이지 */

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth/config";
import { InquiryDetailClient } from "@/src/components/inquiry/inquiry-detail-client";

export const metadata: Metadata = {
  title: "문의 상세",
};

export default async function InquiryDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/inquiry");
  }

  const { id } = await props.params;
  return <InquiryDetailClient inquiryId={id} />;
}
