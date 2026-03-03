import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth/config";
import { MemberManagementClient } from "./member-management-client";

export default async function MemberManagementPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/admin/members");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return <MemberManagementClient />;
}
