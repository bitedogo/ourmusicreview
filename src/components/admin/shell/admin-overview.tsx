/** 관리자 홈 — 할 일 숫자와 최근 목록 */

import Link from "next/link";
import type { AdminOverviewData, AdminOverviewItem } from "@/src/lib/admin/admin-overview-service";
import { formatDateYYYYMMDDHHmm } from "@/src/lib/utils/date";

interface AdminOverviewProps {
  data: AdminOverviewData;
}

function OverviewCard({
  label,
  value,
  href,
}: {
  label: string;
  value: number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-1 flex-col justify-between rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-200/70 transition hover:ring-[var(--color-brand-primary)]"
    >
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-6 text-4xl font-semibold tracking-tight text-[var(--color-brand-primary)]">
        {value}
      </p>
    </Link>
  );
}

function OverviewList({
  title,
  href,
  items,
  empty,
}: {
  title: string;
  href: string;
  items: AdminOverviewItem[];
  empty: string;
}) {
  return (
    <section className="flex min-h-[16rem] flex-col rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-200/70">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">{title}</h2>
        <Link
          href={href}
          className="text-sm font-medium text-[var(--color-brand-primary)] hover:underline"
        >
          전체 보기
        </Link>
      </div>
      {items.length === 0 ? (
        <p className="flex flex-1 items-center justify-center text-sm text-zinc-400">
          {empty}
        </p>
      ) : (
        <ul className="divide-y divide-zinc-100">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className="flex items-start justify-between gap-3 py-3 transition hover:text-[var(--color-brand-primary)]"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">
                    {item.title}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-zinc-400">
                    {item.meta}
                  </span>
                </span>
                <time className="shrink-0 text-xs text-zinc-400">
                  {formatDateYYYYMMDDHHmm(item.createdAt)}
                </time>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

const CONTENT_LINKS = [
  { href: "/admin/albums", label: "오늘의 앨범", hint: "날짜별 추천 앨범" },
  { href: "/admin/new-releases", label: "신보 등록", hint: "홈 Upcoming" },
  { href: "/admin/featured-slide", label: "슬라이드", hint: "홈 피처드" },
  { href: "/admin/faq", label: "FAQ", hint: "자주 묻는 질문" },
  { href: "/admin/members", label: "멤버", hint: "권한·제재" },
] as const;

export function AdminOverview({ data }: AdminOverviewProps) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          ORU ADMIN DASHBOARD
        </h1>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <OverviewCard
          label="승인 대기 리뷰"
          value={data.counts.pendingReviews}
          href="/admin/reviews"
        />
        <OverviewCard
          label="미처리 신고"
          value={data.counts.openReports}
          href="/admin/reports"
        />
        <OverviewCard
          label="답변 대기 문의"
          value={data.counts.waitingInquiries}
          href="/admin/inquiries"
        />
      </section>

      <section className="grid gap-3 lg:grid-cols-3">
        <OverviewList
          title="승인 대기"
          href="/admin/reviews"
          items={data.reviews}
          empty="대기 중인 리뷰가 없습니다."
        />
        <OverviewList
          title="최근 신고"
          href="/admin/reports"
          items={data.reports}
          empty="처리할 신고가 없습니다."
        />
        <OverviewList
          title="답변 대기"
          href="/admin/inquiries"
          items={data.inquiries}
          empty="답변 대기 문의가 없습니다."
        />
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-zinc-200/70">
        <h2 className="mb-4 text-base font-semibold">콘텐츠</h2>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {CONTENT_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl border border-zinc-100 px-4 py-3 transition hover:border-[var(--color-brand-primary)] hover:bg-zinc-50"
            >
              <span className="block text-sm font-medium">{item.label}</span>
              <span className="mt-0.5 block text-xs text-zinc-400">
                {item.hint}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
