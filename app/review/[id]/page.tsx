import { notFound } from "next/navigation";
import { ReviewDetailClient } from "./review-detail-client";

export default async function ReviewDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  if (!id) {
    notFound();
  }

  return <ReviewDetailClient reviewId={id} />;
}
