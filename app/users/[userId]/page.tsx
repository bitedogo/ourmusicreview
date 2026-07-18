/** 타인 유저 프로필 서버 페이지 */

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth/config";
import { UserProfileClient } from "./user-profile-client";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect(`/auth/signin?callbackUrl=/users/${encodeURIComponent(userId)}`);
  }

  return <UserProfileClient userId={userId} />;
}
