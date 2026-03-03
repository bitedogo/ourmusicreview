import { notFound } from "next/navigation";
import { AlbumReviewsClient } from "./album-reviews-client";

export default async function AlbumReviewsPage(props: {
  params: Promise<{ albumId: string }>;
}) {
  const { albumId } = await props.params;

  if (!albumId) {
    notFound();
  }

  return <AlbumReviewsClient albumId={albumId} />;
}
