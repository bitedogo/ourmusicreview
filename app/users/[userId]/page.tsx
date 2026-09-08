/** 타인 유저 프로필 서버 페이지 */

import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { cache } from "react";
import { authOptions } from "@/src/lib/auth/config";
import { initializeDatabase } from "@/src/lib/db";
import { User } from "@/src/lib/db/entities/User";
import { UserProfileClient } from "./user-profile-client";

const getPublicUser = cache(async (userId: string) => {
  const dataSource = await initializeDatabase();
  return dataSource.getRepository(User).findOne({
    where: { id: userId },
    select: ["id", "nickname", "profileImage"],
  });
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ userId: string }>;
}): Promise<Metadata> {
  const { userId } = await params;
  const canonical = `/users/${encodeURIComponent(userId)}`;

  try {
    const user = await getPublicUser(userId);
    if (!user) {
      return {
        title: "사용자를 찾을 수 없습니다",
        alternates: { canonical },
        robots: { index: false, follow: false },
      };
    }
    const title = `${user.nickname}님의 프로필`;
    const description = `${user.nickname}님이 ORU에서 남긴 음악 기록을 확인해보세요.`;
    return {
      title,
      description,
      alternates: { canonical },
      openGraph: {
        type: "profile",
        url: canonical,
        title,
        description,
        images: user.profileImage ? [user.profileImage] : undefined,
      },
    };
  } catch {
    return {
      title: "사용자 프로필",
      alternates: { canonical },
      robots: { index: false, follow: false },
    };
  }
}

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

  const user = await getPublicUser(userId);
  if (!user) {
    notFound();
  }

  return <UserProfileClient userId={userId} />;
}
