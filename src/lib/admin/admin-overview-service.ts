/** 관리자 홈 숫자·최근 목록 */

import type { DataSource } from "typeorm";
import { In, IsNull } from "typeorm";
import { Inquiry } from "@/src/lib/db/entities/Inquiry";
import { Report } from "@/src/lib/db/entities/Report";
import { Review } from "@/src/lib/db/entities/Review";
import { User } from "@/src/lib/db/entities/User";
import { categoryLabel } from "@/src/lib/inquiries/types";

const RECENT_LIMIT = 5;
const PENDING_REVIEW_WHERE = {
  isApproved: "N" as const,
  rejectReason: IsNull(),
};

export interface AdminOverviewItem {
  id: string;
  title: string;
  meta: string;
  href: string;
  createdAt: string;
}

export interface AdminOverviewData {
  counts: {
    pendingReviews: number;
    openReports: number;
    waitingInquiries: number;
  };
  reviews: AdminOverviewItem[];
  reports: AdminOverviewItem[];
  inquiries: AdminOverviewItem[];
}

export async function getAdminOverview(
  dataSource: DataSource
): Promise<AdminOverviewData> {
  const reviewRepository = dataSource.getRepository(Review);
  const reportRepository = dataSource.getRepository(Report);
  const inquiryRepository = dataSource.getRepository(Inquiry);

  const [
    pendingReviews,
    recentReviews,
    openReports,
    recentReports,
    waitingInquiries,
    recentInquiries,
  ] = await Promise.all([
    reviewRepository.count({ where: PENDING_REVIEW_WHERE }),
    reviewRepository.find({
      where: PENDING_REVIEW_WHERE,
      relations: ["user", "album"],
      order: { createdAt: "ASC" },
      take: RECENT_LIMIT,
    }),
    reportRepository.count(),
    reportRepository.find({
      relations: ["user", "post", "review", "review.album"],
      order: { createdAt: "DESC" },
      take: RECENT_LIMIT,
    }),
    inquiryRepository.count({ where: { status: "WAITING" } }),
    inquiryRepository.find({
      where: { status: "WAITING" },
      order: { createdAt: "DESC" },
      take: RECENT_LIMIT,
    }),
  ]);

  const inquiryUserIds = [
    ...new Set(recentInquiries.map((inquiry) => inquiry.userId)),
  ];
  const inquiryUsers =
    inquiryUserIds.length === 0
      ? []
      : await dataSource.getRepository(User).find({
          where: { id: In(inquiryUserIds) },
          select: ["id", "nickname"],
        });
  const nicknameByUserId = new Map(
    inquiryUsers.map((user) => [user.id, user.nickname])
  );

  return {
    counts: {
      pendingReviews,
      openReports,
      waitingInquiries,
    },
    reviews: recentReviews.map((review) => ({
      id: review.id,
      title: review.album?.title?.trim() || "제목 없는 앨범",
      meta: review.user?.nickname?.trim() || "알 수 없음",
      href: "/admin/reviews",
      createdAt: review.createdAt.toISOString(),
    })),
    reports: recentReports.map((report) => ({
      id: report.id,
      title:
        report.post?.title?.trim() ||
        report.review?.album?.title?.trim() ||
        "대상 없음",
      meta: report.user?.nickname?.trim() || "알 수 없음",
      href: "/admin/reports",
      createdAt: report.createdAt.toISOString(),
    })),
    inquiries: recentInquiries.map((inquiry) => ({
      id: inquiry.id,
      title: inquiry.title,
      meta: `${inquiry.publicCode} · ${categoryLabel(inquiry.category)} · ${
        nicknameByUserId.get(inquiry.userId) ?? "알 수 없음"
      }`,
      href: `/admin/inquiries`,
      createdAt: inquiry.createdAt.toISOString(),
    })),
  };
}
