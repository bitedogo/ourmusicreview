import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth/config";
import { redirect } from "next/navigation";
import { FaqManagementClient } from "./faq-management-client";

export default async function AdminFaqPage() {
  const session = await getServerSession(authOptions);
  const isAdmin = (session?.user as { role?: string })?.role === "ADMIN";

  if (!session?.user?.id || !isAdmin) {
    redirect("/auth/signin?callbackUrl=/admin/faq");
  }

  return (
    <div className="mx-auto min-h-screen max-w-4xl px-6 py-10">
      <FaqManagementClient />
    </div>
  );
}
