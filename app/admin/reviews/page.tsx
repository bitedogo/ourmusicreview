import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth/config";
import { ReviewApprovalClient } from "./review-approval-client";

export default async function ReviewApprovalPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/admin/reviews");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return <ReviewApprovalClient />;
}
