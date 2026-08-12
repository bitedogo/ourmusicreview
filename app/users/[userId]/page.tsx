/** 타인 유저 프로필 서버 페이지 */

import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth/config";
import { initializeDatabase } from "@/src/lib/db";
import { User } from "@/src/lib/db/entities/User";
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

  const dataSource = await initializeDatabase();
  const user = await dataSource.getRepository(User).findOne({
    where: { id: userId },
    select: ["id"],
  });
  if (!user) {
    notFound();
  }

  return <UserProfileClient userId={userId} />;
}
