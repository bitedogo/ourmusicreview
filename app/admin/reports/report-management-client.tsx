"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

interface ReportItem {
  id: string;
  reason: string;
  createdAt: string;
  reporter: {
    id: string;
    nickname: string;
    profileImage: string | null;
  } | null;
  post: {
    id: string;
    title: string;
    content: string | null;
    category: string;
    authorNickname?: string;
  } | null;
  review: {
    id: string;
    content: string | null;
    rating: number;
    authorNickname?: string | null;
    album: {
      albumId: string;
      title: string;
      artist: string;
    } | null;
  } | null;
}

export function ReportManagementClient() {
  const router = useRouter();
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/reports");
      const data = await response.json();

      if (!response.ok || !data?.ok) {
        setError(data?.error ?? "신고 목록을 불러올 수 없습니다.");
        return;
      }

      setReports(data.reports || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "신고 목록을 불러오는 중 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDismiss(reportId: string) {
    setProcessingIds((prev) => new Set(prev).add(reportId));
    try {
      const response = await fetch(
        `/api/admin/reports/${encodeURIComponent(reportId)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "dismiss" }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data?.ok) {
        alert(data?.error ?? "신고 무시 처리에 실패했습니다.");
        return;
      }

      setReports((prev) => prev.filter((r) => r.id !== reportId));
    } catch (err) {
      alert(
        err instanceof Error
          ? `신고 처리 중 오류가 발생했습니다: ${err.message}`
          : "신고 처리 중 알 수 없는 오류가 발생했습니다."
      );
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(reportId);
        return next;
      });
    }
  }

  async function handleDeleteContent(
    reportId: string,
    action: "delete_post" | "delete_review"
  ) {
    const message =
      action === "delete_post"
        ? "이 게시글을 삭제하시겠습니까? 삭제 후에는 복구할 수 없습니다."
        : "이 리뷰를 삭제하시겠습니까? 삭제 후에는 복구할 수 없습니다.";

    if (!confirm(message)) return;

    setProcessingIds((prev) => new Set(prev).add(reportId));
    try {
      const response = await fetch(
        `/api/admin/reports/${encodeURIComponent(reportId)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data?.ok) {
        alert(data?.error ?? "삭제에 실패했습니다.");
        return;
      }

      setReports((prev) => prev.filter((r) => r.id !== reportId));
    } catch (err) {
      alert(
        err instanceof Error
          ? `처리 중 오류가 발생했습니다: ${err.message}`
          : "처리 중 알 수 없는 오류가 발생했습니다."
      );
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(reportId);
        return next;
      });
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-6 py-10 sm:px-16">
        <div className="flex items-center justify-center py-12">
          <div className="text-sm text-zinc-500">신고 목록을 불러오는 중...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-6 py-10 sm:px-16">
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {error}
        </div>
        <button
          onClick={() => router.back()}
          className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
        >
          뒤로 가기
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-6 py-10 sm:px-16">
      <section>
        <h1 className="text-xl font-semibold tracking-tight">신고 관리</h1>
      </section>

      {reports.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-8 text-center text-sm text-zinc-500">
          처리 대기 중인 신고가 없습니다.
        </div>
      ) : (
        <div className="overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50 text-[11px] font-semibold text-zinc-500">
                  <th className="px-3 py-2 text-left">신고 대상</th>
                  <th className="px-3 py-2 text-left">신고 사유</th>
                  <th className="px-3 py-2 text-left">신고자</th>
                  <th className="px-3 py-2 text-left">신고일</th>
                  <th className="px-3 py-2 text-left">원문</th>
                  <th className="px-3 py-2 text-left">처리</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => {
                  const isProcessing = processingIds.has(report.id);
                  const isPost = !!report.post;
                  const targetNickname = isPost
                    ? report.post!.authorNickname ?? null
                    : report.review?.authorNickname ?? null;

                  return (
                    <tr
                      key={report.id}
                      className="hover:bg-zinc-50"
                    >
                      <td className="max-w-[220px] px-3 py-2 align-middle">
                        <span className="text-xs font-semibold text-zinc-900">
                          {targetNickname ?? "알 수 없음"}
                        </span>
                      </td>
                      <td className="max-w-[200px] px-3 py-2 align-middle">
                        <span className="block truncate text-xs text-zinc-700">
                          {((report.reason?.split("\n")[0] ?? report.reason) || "-").trim()}
                        </span>
                      </td>
                      <td className="px-3 py-2 align-middle">
                        <span className="text-xs font-semibold text-zinc-900">
                          {report.reporter?.nickname ?? "알 수 없음"}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-left align-middle">
                        <span className="text-[11px] text-zinc-500">
                          {formatDate(report.createdAt)}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-left align-middle">
                        {isPost && (
                          <Link
                            href={`/community/${report.post!.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-medium text-zinc-700 underline underline-offset-2 hover:text-zinc-900"
                          >
                            보기
                          </Link>
                        )}
                        {!isPost && report.review && (
                          <Link
                            href={`/review/${report.review.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-medium text-zinc-700 underline underline-offset-2 hover:text-zinc-900"
                          >
                            보기
                          </Link>
                        )}
                        {!report.post && !report.review && (
                          <span className="text-[11px] text-zinc-400">삭제됨</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-left align-middle">
                        <select
                          value=""
                          onChange={(e) => {
                            const value = e.target.value;
                            if (!value) return;
                            if (value === "dismiss") handleDismiss(report.id);
                            else if (value === "delete_post" || value === "delete_review")
                              handleDeleteContent(report.id, value);
                            e.target.value = "";
                          }}
                          disabled={isProcessing}
                          className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-[11px] font-medium text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">처리 선택</option>
                          <option value="dismiss">무시</option>
                          {report.post && (
                            <option value="delete_post">게시글 삭제</option>
                          )}
                          {report.review && (
                            <option value="delete_review">리뷰 삭제</option>
                          )}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
