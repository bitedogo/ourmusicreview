"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { getPaginationItems } from "@/src/lib/utils/pagination";

interface Member {
  id: string;
  email: string;
  nickname: string;
  name: string | null;
  gender: string | null;
  role: "USER" | "ADMIN";
  profileImage: string | null;
  createdAt: string;
  slideCount: number;
  reviewCount: number;
  favoriteCount: number;
}

interface MemberDetail {
  id: string;
  nickname: string;
  name: string | null;
  email: string;
  gender: string | null;
  role: "USER" | "ADMIN";
  profileImage: string | null;
  createdAt: string;
  slideCount: number;
  reviewCount: number;
  favoriteCount: number;
  hasUserSlide: boolean;
  slideAlbums: Array<{
    id: string;
    collectionId: string;
    title: string;
    artist: string;
    imageUrl: string | null;
  }>;
}

type TabType = "all" | "admin";

export function MemberManagementClient() {
  const router = useRouter();
  const { data: session } = useSession();
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<MemberDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState<"nickname" | "role" | "createdAt" | "email">("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    let list = members;

    if (activeTab === "admin") {
      list = list.filter((m) => m.role === "ADMIN");
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (m) =>
          m.nickname.toLowerCase().includes(q) ||
          m.id.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q)
      );
    }

    list = [...list].sort((a, b) => {
      let cmp = 0;
      switch (sortColumn) {
        case "nickname":
          cmp = (a.nickname || a.id).localeCompare(b.nickname || b.id);
          break;
        case "role":
          cmp = (a.role === "ADMIN" ? 1 : 0) - (b.role === "ADMIN" ? 1 : 0);
          break;
        case "createdAt":
          cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case "email":
          cmp = (a.email || "").localeCompare(b.email || "");
          break;
        default:
          break;
      }
      return sortDirection === "asc" ? cmp : -cmp;
    });

    setFilteredMembers(list);
    setCurrentPage(1);
  }, [members, activeTab, searchQuery, sortColumn, sortDirection]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    fetchDetail(selectedId);
  }, [selectedId]);

  async function fetchMembers() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/members");
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        setError(data?.error ?? "멤버 목록을 불러올 수 없습니다.");
        return;
      }
      setMembers(data?.data?.members || []);
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

  async function fetchDetail(id: string) {
    setIsLoadingDetail(true);
    try {
      const res = await fetch(`/api/admin/members/${encodeURIComponent(id)}`);
      const data = await res.json();
      if (res.ok && data?.ok) {
        setDetail(data.data.member);
      } else {
        setDetail(null);
      }
    } catch {
      setDetail(null);
    } finally {
      setIsLoadingDetail(false);
    }
  }

  async function handleDeleteMember(memberId: string) {
    if (
      !confirm(
        "정말로 이 계정을 삭제하시겠습니까?\n삭제된 계정은 복구할 수 없습니다."
      )
    )
      return;
    setProcessingIds((prev) => new Set(prev).add(memberId));
    try {
      const res = await fetch(
        `/api/admin/members/${encodeURIComponent(memberId)}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        alert(data?.error ?? "계정 삭제에 실패했습니다.");
        return;
      }
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
      if (selectedId === memberId) setSelectedId(null);
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
      const res = await fetch(
        `/api/admin/members/${encodeURIComponent(memberId)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: newRole }),
        }
      );
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        alert(data?.error ?? "멤버 권한 변경에 실패했습니다.");
        return;
      }
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
      );
      if (detail?.id === memberId) {
        setDetail((d) => (d ? { ...d, role: newRole } : null));
      }
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
      return new Date(dateString).toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const GENDER_LABEL: Record<string, string> = {
    MALE: "남성",
    FEMALE: "여성",
    NONE: "-",
  };

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-6 py-10 sm:px-16">
        <div className="flex items-center justify-center py-12">
          <div className="text-sm text-zinc-500">목록을 불러오는 중...</div>
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

  const totalPages = Math.ceil(filteredMembers.length / PAGE_SIZE) || 1;
  const paginatedMembers = filteredMembers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-6 py-10 sm:px-16">
      <section className="flex flex-col gap-4">
        <div className="flex w-full flex-wrap items-baseline justify-between gap-3">
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
            멤버 관리
          </h1>
          <p className="text-right text-sm text-zinc-500">
            총 멤버{" "}
            <span className="font-semibold text-zinc-800">{members.length}</span>명
            {filteredMembers.length !== members.length ? (
              <>
                {" "}
                · 현재 목록{" "}
                <span className="font-semibold text-zinc-800">
                  {filteredMembers.length}
                </span>
                명
              </>
            ) : null}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-3">
          {[
            { key: "all" as TabType, label: "전체회원" },
            { key: "admin" as TabType, label: "관리자" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`border-b-2 px-4 py-2 text-xs font-medium transition ${
                activeTab === tab.key
                  ? "border-[var(--color-brand-primary)] text-[var(--color-brand-primary)]"
                  : "border-transparent text-zinc-500 hover:text-zinc-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
          <input
            type="text"
            placeholder="검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ml-auto w-32 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs placeholder:text-zinc-400 focus:border-[var(--color-brand-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-primary)] sm:w-40"
          />
        </div>
      </section>

      {filteredMembers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-8 text-center text-sm text-zinc-500">
          {activeTab === "all"
            ? "등록된 멤버가 없습니다."
            : "관리자가 없습니다."}
        </div>
      ) : (
        <div className="overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-zinc-200 bg-zinc-50 text-[11px] font-semibold text-zinc-500">
                      {(["nickname", "role", "createdAt", "email"] as const).map((col) => {
                        const labels: Record<typeof col, string> = {
                          nickname: "닉네임",
                          role: "역할",
                          createdAt: "가입일",
                          email: "이메일",
                        };
                        const isActive = sortColumn === col;
                        const isCreatedAt = col === "createdAt";
                        return (
                          <th
                            key={col}
                            scope="col"
                            onClick={() => {
                              if (isActive) {
                                setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
                              } else {
                                setSortColumn(col);
                                setSortDirection(col === "createdAt" ? "desc" : "asc");
                              }
                            }}
                            className={`cursor-pointer select-none whitespace-nowrap px-4 py-3 transition hover:bg-zinc-100 ${isActive ? "text-[var(--color-brand-primary)]" : ""} ${isCreatedAt ? "hidden sm:table-cell" : ""}`}
                          >
                            <span className="inline-flex items-center gap-1">
                              {labels[col]}
                              {isActive && (
                                <span className="text-[10px]" aria-hidden>
                                  {sortDirection === "asc" ? "↑" : "↓"}
                                </span>
                              )}
                            </span>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedMembers.map((member, idx) => {
                  const isSelected = selectedId === member.id;
                  const isCurrentUser = member.id === session?.user?.id;
                  return (
                    <tr
                      key={member.id}
                      onClick={() => setSelectedId(member.id)}
                      className={`cursor-pointer border-b border-zinc-100 transition-colors ${
                        isSelected
                          ? "bg-[var(--color-brand-primary)] text-white hover:bg-[var(--color-brand-primary-hover)]"
                          : idx % 2 === 1
                            ? "bg-zinc-50/50 hover:bg-zinc-100"
                            : "bg-white hover:bg-zinc-50"
                      }`}
                    >
                      <td className="min-w-0 whitespace-nowrap px-4 py-3">
                        <div className="flex min-w-0 items-center gap-3">
                          {member.profileImage ? (
                            <Image
                              src={member.profileImage}
                              alt={member.nickname}
                              width={32}
                              height={32}
                              unoptimized
                              className="h-8 w-8 shrink-0 rounded-full object-cover"
                            />
                          ) : (
                            <div
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                                isSelected
                                  ? "bg-white/20 text-white"
                                  : "bg-zinc-200 text-zinc-600"
                              }`}
                            >
                              {member.nickname?.charAt(0)?.toUpperCase() ?? "?"}
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="truncate font-medium">
                              {member.nickname}
                              {isCurrentUser && (
                                <span
                                  className={
                                    isSelected ? "text-white/80" : "text-zinc-400"
                                  }
                                >
                                  {" "}
                                  (나)
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        {member.role === "ADMIN" ? "관리자" : "일반"}
                      </td>
                      <td className="hidden whitespace-nowrap px-4 py-3 text-zinc-500 sm:table-cell">
                        {formatDate(member.createdAt)}
                      </td>
                      <td className="max-w-[120px] truncate whitespace-nowrap px-4 py-3 text-zinc-500 sm:max-w-[180px]">
                        {member.email}
                      </td>
                    </tr>
                  );
                    })}
                  </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-1 border-t border-zinc-200 bg-zinc-50 px-4 py-3">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                이전
              </button>
              {getPaginationItems(currentPage, totalPages).map((item, idx) =>
                item === "ellipsis" ? (
                  <span
                    key={`e-${idx}`}
                    className="px-1 py-1.5 text-xs text-zinc-400"
                    aria-hidden
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCurrentPage(item)}
                    className={`min-w-[2rem] rounded-lg px-2 py-1.5 text-xs font-medium ${
                      item === currentPage
                        ? "bg-[var(--color-brand-primary)] text-white"
                        : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                    }`}
                  >
                    {item}
                  </button>
                )
              )}
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                다음
              </button>
            </div>
          )}
        </div>
      )}

      {selectedId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedId(null)}
          aria-hidden
        >
          <div
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                {detail?.id ?? selectedId}
              </p>
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
                aria-label="닫기"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex w-full flex-col gap-6">
            {isLoadingDetail ? (
              <div className="flex flex-1 items-center justify-center">
                <p className="text-sm text-zinc-500">불러오는 중...</p>
              </div>
            ) : !detail ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
                <p className="text-sm text-zinc-500">멤버 정보를 불러올 수 없습니다.</p>
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  className="text-xs text-[var(--color-brand-primary)] hover:underline"
                >
                  닫기
                </button>
              </div>
            ) : (
              <>
                <div className="flex w-full flex-col items-center gap-3">
                  <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-zinc-100 bg-zinc-100">
                    {detail.profileImage ? (
                      <Image
                        src={detail.profileImage}
                        alt={detail.nickname}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-zinc-400">
                        {detail.nickname?.charAt(0)?.toUpperCase() ?? "?"}
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <h2 className="text-lg font-bold text-zinc-900">
                      {detail.nickname}
                    </h2>
                    <p className="text-xs text-zinc-500">
                      {detail.role === "ADMIN" ? "관리자" : "일반 회원"}
                    </p>
                  </div>
                </div>

                <div className="grid w-full grid-cols-2 gap-4 rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 sm:grid-cols-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                      나만의 명반
                    </p>
                    <p className="mt-1 text-sm font-semibold text-zinc-900">
                      {detail.slideCount}개
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                      리뷰
                    </p>
                    <p className="mt-1 text-sm font-semibold text-zinc-900">
                      {detail.reviewCount}개
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                      좋아요
                    </p>
                    <p className="mt-1 text-sm font-semibold text-zinc-900">
                      {detail.favoriteCount}개
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                      슬라이드 표시
                    </p>
                    <p className="mt-1 text-sm font-semibold text-zinc-900">
                      {detail.hasUserSlide ? "표시됨" : "미표시"}
                    </p>
                  </div>
                </div>

                <div className="w-full space-y-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                    정보
                  </p>
                  <div className="grid grid-cols-1 gap-x-4 gap-y-3 text-sm sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <p className="text-[10px] font-medium text-zinc-400">
                        이름
                      </p>
                      <p className="break-words text-zinc-900">{detail.name ?? "-"}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-zinc-400">
                        성별
                      </p>
                      <p className="text-zinc-900">
                        {detail.gender
                          ? GENDER_LABEL[detail.gender] ?? detail.gender
                          : "-"}
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-[10px] font-medium text-zinc-400">
                        가입일
                      </p>
                      <p className="text-zinc-900">
                        {formatDate(detail.createdAt)}
                      </p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-[10px] font-medium text-zinc-400">
                        이메일
                      </p>
                      <p className="truncate text-zinc-900">{detail.email}</p>
                    </div>
                  </div>
                </div>

                {detail.slideAlbums.length > 0 && (
                  <div className="w-full space-y-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                      나만의 명반 ({detail.slideAlbums.length}개)
                    </p>
                    <div className="grid max-h-64 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4 lg:grid-cols-6">
                      {detail.slideAlbums.map((album) => (
                        <div
                          key={album.id}
                          className="overflow-hidden rounded-lg border border-zinc-100 bg-zinc-50"
                        >
                          {album.imageUrl ? (
                            <div className="relative aspect-square">
                              <Image
                                src={album.imageUrl}
                                alt={album.title}
                                fill
                                unoptimized
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="aspect-square bg-zinc-200" />
                          )}
                          <p className="truncate px-2 py-1 text-[10px] font-medium text-zinc-900">
                            {album.title}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {detail.id !== session?.user?.id && (
                  <div className="mt-auto space-y-3 border-t border-zinc-100 pt-4">
                    <div className="flex items-center gap-2">
                      <label className="text-[10px] font-medium text-zinc-500">
                        역할:
                      </label>
                      <select
                        value={detail.role}
                        onChange={(e) =>
                          handleRoleChange(
                            detail.id,
                            e.target.value as "USER" | "ADMIN"
                          )
                        }
                        disabled={processingIds.has(detail.id)}
                        className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 disabled:opacity-50"
                      >
                        <option value="USER">일반 사용자</option>
                        <option value="ADMIN">관리자</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteMember(detail.id)}
                      disabled={processingIds.has(detail.id)}
                      className="w-full rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                    >
                      {processingIds.has(detail.id) ? "처리 중..." : "계정 삭제"}
                    </button>
                  </div>
                )}
              </>
            )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
