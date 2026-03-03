import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth/config";
import { initializeDatabase } from "@/src/lib/db";
import { User } from "@/src/lib/db/entities/User";
import { ProfileClient } from "./profile-client";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/profile");
  }

  const dataSource = await initializeDatabase();
  const userRepository = dataSource.getRepository(User);
  const user = await userRepository.findOne({
    where: { id: session.user.id },
  });

  if (!user) {
    redirect("/auth/signin?callbackUrl=/profile");
  }

  const createdAtText = user.createdAt
    ? new Date(user.createdAt).toLocaleString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

  return (
    <ProfileClient
      id={user.id}
      nickname={user.nickname}
      role={user.role}
      createdAtText={createdAtText}
      profileImage={user.profileImage ?? null}
    />
  );
}

