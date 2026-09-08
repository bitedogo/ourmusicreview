/** 리뷰 상세 서버 페이지 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { withDatabaseRead } from "@/src/lib/db";
import { Review } from "@/src/lib/db/entities/Review";
import { OG_IMAGE_SRC } from "@/src/lib/site/branding";
import { ReviewDetailClient } from "./review-detail-client";

function summarize(content: string): string {
  const text = content
    .replace(/<[^>]*>/g, " ")
    .replace(/[#*_>`~[\]()!-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.slice(0, 160) || "ORU에서 앨범 리뷰를 확인해보세요.";
}

export async function generateMetadata(props: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await props.params;
  const canonical = `/review/${encodeURIComponent(id)}`;

  try {
    const review = await withDatabaseRead((dataSource) =>
      dataSource.getRepository(Review).findOne({
        where: { id, isApproved: "Y" },
        relations: ["album", "user"],
      })
    );
    if (!review) {
      return {
        title: "리뷰를 찾을 수 없습니다",
        alternates: { canonical },
        robots: { index: false, follow: false },
      };
    }

    const title = `${review.album.title} 리뷰`;
    const description = summarize(review.content);
    const image = review.album.imageUrl || OG_IMAGE_SRC;
    return {
      title,
      description,
      alternates: { canonical },
      openGraph: {
        type: "article",
        url: canonical,
        title,
        description,
        images: [image],
      },
    };
  } catch {
    return {
      title: "앨범 리뷰",
      alternates: { canonical },
      robots: { index: false, follow: false },
    };
  }
}

export default async function ReviewDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  if (!id) {
    notFound();
  }

  return <ReviewDetailClient reviewId={id} />;
}
