"use client";
/** 관리자 회원 관리 클라이언트 */

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { fetchJson, getApiErrorMessage } from "@/src/lib/http/client";
import { filterAndSortMembers } from "./member-filter";
import { MemberFilterBar } from "./MemberFilterBar";
import { MemberTable } from "./MemberTable";
import { MemberDetailPanel } from "./MemberDetailPanel";
import type {
  Member,
  MemberDetail,
  MemberDetailResponse,
  MembersListResponse,
  MemberSortColumn,
  MemberTabType,
} from "./types";

export function MemberManagementClient() {
  const router = useRouter();
  const { data: session } = useSession();
  const [members, setMembers] = useState<Member[]>([]);
  const [activeTab, setActiveTab] = useState<MemberTabType>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<MemberDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState<MemberSortColumn>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  const filteredMembers = useMemo(
    () =>
      filterAndSortMembers(members, {
        activeTab,
        searchQuery,
        sortColumn,
        sortDirection,
      }),
    [members, activeTab, searchQuery, sortColumn, sortDirection]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, sortColumn, sortDirection]);

  useEffect(() => {
    void fetchMembers();
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    void fetchDetail(selectedId);
  }, [selectedId]);

  async function fetchMembers() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchJson<MembersListResponse>("/api/admin/members");
      setMembers(data.data.members || []);
    } catch (err) {
      setError(getApiErrorMessage(err, "멤버 목록을 불러오는 중 오류가 발생했습니다."));
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchDetail(id: string) {
    setIsLoadingDetail(true);
    try {
      const data = await fetchJson<MemberDetailResponse>(
        `/api/admin/members/${encodeURIComponent(id)}`
      );
      setDetail(data.data.member);
    } catch {
      setDetail(null);
    } finally {
      setIsLoadingDetail(false);
    }
  }

  async function handleDeleteMember(memberId: string) {
    if (
      !confirm(
        "정말로 이 계정을 삭제하시겠습니까?\n삭제된 계정은 복구할 수 없으며, 해당 이메일로는 다시 가입할 수 없습니다."
      )
    )
      return;
    setProcessingIds((prev) => new Set(prev).add(memberId));
    try {
      await fetchJson<{ ok: true }>(
        `/api/admin/members/${encodeURIComponent(memberId)}`,
        { method: "DELETE" }
      );
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
      if (selectedId === memberId) setSelectedId(null);
    } catch (err) {
      alert(getApiErrorMessage(err, "계정 삭제 중 오류가 발생했습니다."));
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
      await fetchJson<{ ok: true }>(
        `/api/admin/members/${encodeURIComponent(memberId)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: newRole }),
        }
      );
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
      );
      if (detail?.id === memberId) {
        setDetail((d) => (d ? { ...d, role: newRole } : null));
      }
    } catch (err) {
      alert(getApiErrorMessage(err, "멤버 권한 변경 중 오류가 발생했습니다."));
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(memberId);
        return next;
      });
    }
  }

  async function handleSanction(
    memberId: string,
    payload: {
      action: "warn" | "suspend" | "unsuspend";
      reason: string;
      suspendedUntil?: string;
    }
  ) {
    setProcessingIds((prev) => new Set(prev).add(memberId));
    try {
      const data = await fetchJson<{
        ok: true;
        data: {
          member: {
            id: string;
            accountStatus: Member["accountStatus"];
            warningCount: number;
            suspendedUntil: string | null;
            suspendReason: string | null;
          };
          sanctions: MemberDetail["sanctions"];
        };
      }>(`/api/admin/members/${encodeURIComponent(memberId)}/sanctions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const next = data.data.member;
      setMembers((prev) =>
        prev.map((m) =>
          m.id === memberId
            ? {
                ...m,
                accountStatus: next.accountStatus,
                warningCount: next.warningCount,
                suspendedUntil: next.suspendedUntil,
                suspendReason: next.suspendReason,
              }
            : m
        )
      );
      if (detail?.id === memberId) {
        setDetail((d) =>
          d
            ? {
                ...d,
                accountStatus: next.accountStatus,
                warningCount: next.warningCount,
                suspendedUntil: next.suspendedUntil,
                suspendReason: next.suspendReason,
                sanctions: data.data.sanctions,
              }
            : null
        );
      }
    } catch (err) {
      alert(getApiErrorMessage(err, "제재 처리 중 오류가 발생했습니다."));
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(memberId);
        return next;
      });
    }
  }

  function handleSortChange(column: MemberSortColumn) {
    if (sortColumn === column) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection(column === "createdAt" ? "desc" : "asc");
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-6 py-10 sm:px-16">
        <div className="flex items-center justify-center py-12">
          <div className="text-sm text-[var(--color-text-secondary)]">목록을 불러오는 중...</div>
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
          className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs font-semibold text-[var(--color-text-primary)] hover:bg-zinc-50"
        >
          뒤로 가기
        </button>
      </div>
    );
  }

  const totalPages = Math.ceil(filteredMembers.length / PAGE_SIZE) || 1;
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-6 py-10 sm:px-16">
      <section className="flex flex-col gap-4">
        <div className="flex w-full flex-wrap items-baseline justify-between gap-3">
          <h1 className="text-xl font-semibold tracking-tight text-[var(--color-text-primary)]">
            멤버 관리
          </h1>
          <p className="text-right text-sm text-[var(--color-text-secondary)]">
            총 멤버{" "}
            <span className="font-semibold text-[var(--color-text-primary)]">{members.length}</span>명
            {filteredMembers.length !== members.length ? (
              <>
                {" "}
                · 현재 목록{" "}
                <span className="font-semibold text-[var(--color-text-primary)]">
                  {filteredMembers.length}
                </span>
                명
              </>
            ) : null}
          </p>
        </div>
        <MemberFilterBar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
        />
      </section>

      {filteredMembers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-8 text-center text-sm text-[var(--color-text-secondary)]">
          {activeTab === "all"
            ? "등록된 멤버가 없습니다."
            : activeTab === "admin"
              ? "관리자가 없습니다."
              : activeTab === "warned"
                ? "경고 상태 멤버가 없습니다."
                : "정지 상태 멤버가 없습니다."}
        </div>
      ) : (
        <MemberTable
          members={paginatedMembers}
          currentUserId={session?.user?.id}
          selectedId={selectedId}
          onSelect={setSelectedId}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSortChange={handleSortChange}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {selectedId && (
        <MemberDetailPanel
          selectedId={selectedId}
          detail={detail}
          isLoadingDetail={isLoadingDetail}
          currentUserId={session?.user?.id}
          processingIds={processingIds}
          onClose={() => setSelectedId(null)}
          onRoleChange={handleRoleChange}
          onDelete={handleDeleteMember}
          onSanction={handleSanction}
        />
      )}
    </div>
  );
}
