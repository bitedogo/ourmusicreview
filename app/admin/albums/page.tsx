import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth/config";
import { AlbumManagementClient } from "./album-management-client";

export default async function AlbumManagementPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/admin/albums");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return <AlbumManagementClient />;
}
