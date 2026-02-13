import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth/config";
import { ReviewWriteClient } from "./write-client";

export default async function ReviewWritePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/review/write");
  }

  return <ReviewWriteClient />;
}
