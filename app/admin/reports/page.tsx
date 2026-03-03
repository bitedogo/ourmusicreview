import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth/config";
import { ReportManagementClient } from "./report-management-client";

export default async function ReportManagementPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/admin/reports");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return <ReportManagementClient />;
}
