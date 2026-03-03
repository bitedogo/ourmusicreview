import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth/config";
import { initializeDatabase } from "@/src/lib/db";
import { User } from "@/src/lib/db/entities/User";
import { ProfileEditClient } from "./profile-edit-client";

export default async function ProfileEditPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/profile/edit");
  }

  const dataSource = await initializeDatabase();
  const userRepository = dataSource.getRepository(User);
  const user = await userRepository.findOne({
    where: { id: session.user.id },
  });

  if (!user) {
    redirect("/auth/signin?callbackUrl=/profile/edit");
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
    <ProfileEditClient
      id={user.id}
      nickname={user.nickname}
      role={user.role}
      createdAtText={createdAtText}
      profileImage={user.profileImage ?? null}
    />
  );
}

