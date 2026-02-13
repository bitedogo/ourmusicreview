"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface Member {
  id: string;
  email: string;
  nickname: string;
  role: "USER" | "ADMIN";
  profileImage: string | null;
  createdAt: string;
}

export function MemberManagementClient() {
  const router = useRouter();
  const { data: session } = useSession();
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchMembers();
  }, []);

  async function fetchMembers() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/members");
      const data = await response.json();

      if (!response.ok || !data?.ok) {
        setError(data?.error ?? "멤버 목록을 불러올 수 없습니다.");
        return;
      }

      setMembers(data.members || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "멤버 목록을 불러오는 중 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteMember(memberId: string) {
    if (
      !confirm(
        "정말로 이 계정을 삭제하시겠습니까?\n삭제된 계정은 복구할 수 없습니다."
      )
    ) {
      return;
    }
    setProcessingIds((prev) => new Set(prev).add(memberId));
    try {
      const response = await fetch(
        `/api/admin/members/${encodeURIComponent(memberId)}`,
        { method: "DELETE" }
      );
      const data = await response.json();

      if (!response.ok || !data?.ok) {
        alert(data?.error ?? "계정 삭제에 실패했습니다.");
        return;
      }

      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    } catch (err) {
      alert(
        err instanceof Error
          ? `계정 삭제 중 오류가 발생했습니다: ${err.message}`
          : "계정 삭제 중 알 수 없는 오류가 발생했습니다."
      );
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(memberId);
        return next;
      });
    }
  }

  async function handleRoleChange(memberId: string, newRole: "USER" | "ADMIN") {
    setProcessingIds((prev) => new Set(prev).add(memberId));
    try {
      const response = await fetch(`/api/admin/members/${encodeURIComponent(memberId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await response.json();

      if (!response.ok || !data?.ok) {
        alert(data?.error ?? "멤버 권한 변경에 실패했습니다.");
        return;
      }

      // 권한 변경된 멤버 업데이트
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
      );
    } catch (err) {
      alert(
        err instanceof Error
          ? `멤버 권한 변경 중 오류가 발생했습니다: ${err.message}`
          : "멤버 권한 변경 중 알 수 없는 오류가 발생했습니다."
      );
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(memberId);
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
      });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-6 py-10 sm:px-16">
        <div className="flex items-center justify-center py-12">
          <div className="text-sm text-zinc-500">멤버 목록을 불러오는 중...</div>
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
        <h1 className="text-xl font-semibold tracking-tight">멤버 관리</h1>
      </section>

      {members.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-8 text-center text-sm text-zinc-500">
          등록된 멤버가 없습니다.
        </div>
      ) : (
        <div className="overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50 text-[11px] font-semibold text-zinc-500">
                  <th className="px-3 py-2 text-left">닉네임 / 이메일</th>
                  <th className="px-3 py-2 text-left">역할</th>
                  <th className="px-3 py-2 text-left">가입일</th>
                  <th className="px-3 py-2 text-left">권한 변경</th>
                  <th className="w-10 px-3 py-2 text-center">삭제</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => {
                  const isProcessing = processingIds.has(member.id);
                  const isCurrentUser = member.id === session?.user?.id;
                  return (
                    <tr
                      key={member.id}
                      className="hover:bg-zinc-50"
                    >
                      <td className="px-3 py-2 align-middle">
                        <div className="flex items-center gap-3">
                          {member.profileImage ? (
                            <img
                              src={member.profileImage}
                              alt={member.nickname}
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 text-[11px] font-semibold text-zinc-600">
                              {member.nickname.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="truncate text-xs font-semibold text-zinc-900">
                                {member.nickname}
                              </span>
                              {isCurrentUser && (
                                <span className="text-[10px] text-zinc-500">
                                  (나)
                                </span>
                              )}
                            </div>
                            <p className="truncate text-[11px] text-zinc-500">
                              {member.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2 align-middle">
                        <span className="text-xs text-zinc-700">
                          {member.role === "ADMIN"
                            ? "관리자"
                            : "일반 사용자"}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-left align-middle">
                        <span className="text-[11px] text-zinc-500">
                          {formatDate(member.createdAt)}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-left align-middle">
                        {!isCurrentUser && (
                          <select
                            value={member.role}
                            onChange={(e) =>
                              handleRoleChange(
                                member.id,
                                e.target.value as "USER" | "ADMIN"
                              )
                            }
                            disabled={isProcessing}
                            className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-[11px] font-medium text-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="USER">일반 사용자</option>
                            <option value="ADMIN">관리자</option>
                          </select>
                        )}
                      </td>
                      <td className="px-3 py-2 text-center align-middle">
                        {!isCurrentUser && (
                          <button
                            type="button"
                            onClick={() => handleDeleteMember(member.id)}
                            disabled={isProcessing}
                            className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                            title="계정 삭제"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              className="h-4 w-4"
                            >
                              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                            </svg>
                          </button>
                        )}
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
