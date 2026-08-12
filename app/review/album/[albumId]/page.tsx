/** 앨범별 리뷰 목록 서버 페이지 */

import { notFound } from "next/navigation";
import { AlbumReviewListClient } from "@/src/components/reviews/album-review-list-client";

export default async function AlbumReviewsPage(props: {
  params: Promise<{ albumId: string }>;
}) {
  const { albumId } = await props.params;

  if (!albumId) {
    notFound();
  }

  return <AlbumReviewListClient albumId={albumId} />;
}
