import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth/config";
import { CommunityWriteClient } from "./write-client";

export default async function CommunityWritePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/community/write");
  }

  return <CommunityWriteClient />;
}

