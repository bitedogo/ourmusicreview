import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth/config";
import { FeaturedSlideClient } from "./featured-slide-client";

export default async function FeaturedSlidePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/admin/featured-slide");
  }

  if ((session.user as { role?: string }).role !== "ADMIN") {
    redirect("/");
  }

  return <FeaturedSlideClient />;
}
