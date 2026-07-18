/** 리뷰 수정 서버 진입 */

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth/config";
import { ReviewEditClient } from "./edit-client";

export default async function ReviewEditPage(props: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  const { id } = await props.params;

  if (!session?.user?.id) {
    redirect(`/auth/signin?callbackUrl=/review/${encodeURIComponent(id)}/edit`);
  }

  if (!id) {
    redirect("/reviews");
  }

  return <ReviewEditClient reviewId={id} />;
}
