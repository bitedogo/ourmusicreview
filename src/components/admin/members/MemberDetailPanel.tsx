"use client";
/** 관리자 회원 관리 - 상세 정보 패널 (모달) */

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  ACCOUNT_STATUS_LABEL,
  defaultSuspendUntilLocalValue,
  formatMemberDate,
  formatMemberDateTime,
  GENDER_LABEL,
  SANCTION_ACTION_LABEL,
  type MemberDetail,
} from "./types";

interface MemberDetailPanelProps {
  selectedId: string;
  detail: MemberDetail | null;
  isLoadingDetail: boolean;
  currentUserId: string | undefined;
  processingIds: Set<string>;
  onClose: () => void;
  onRoleChange: (memberId: string, newRole: "USER" | "ADMIN") => void;
  onDelete: (memberId: string) => void;
  onSanction: (
    memberId: string,
    payload: {
      action: "warn" | "suspend" | "unsuspend";
      reason: string;
      suspendedUntil?: string;
    }
  ) => Promise<void>;
}

export function MemberDetailPanel({
  selectedId,
  detail,
  isLoadingDetail,
  currentUserId,
  processingIds,
  onClose,
  onRoleChange,
  onDelete,
  onSanction,
}: MemberDetailPanelProps) {
  const [reason, setReason] = useState("");
  const [suspendUntil, setSuspendUntil] = useState(defaultSuspendUntilLocalValue);

  useEffect(() => {
    setReason("");
    setSuspendUntil(defaultSuspendUntilLocalValue());
  }, [selectedId]);

  const canSanction =
    !!detail && detail.id !== currentUserId && detail.role !== "ADMIN";
  const isProcessing = detail ? processingIds.has(detail.id) : false;

  async function submitSanction(
    action: "warn" | "suspend" | "unsuspend"
  ) {
    if (!detail) return;
    const trimmed = reason.trim();
    if (action !== "unsuspend" && !trimmed) {
      alert("사유를 입력해주세요.");
      return;
    }
    if (action === "suspend") {
      const until = new Date(suspendUntil);
      if (Number.isNaN(until.getTime()) || until.getTime() <= Date.now()) {
        alert("정지 해제 일시는 현재 이후여야 합니다.");
        return;
      }
    }

    const labels = {
      warn: "경고를 부여할까요?",
      suspend: "계정을 일시 정지할까요?",
      unsuspend: "정지를 해제할까요?",
    } as const;
    if (!confirm(labels[action])) return;

    await onSanction(detail.id, {
      action,
      reason: trimmed || "정지 해제",
      suspendedUntil:
        action === "suspend" ? new Date(suspendUntil).toISOString() : undefined,
    });
    setReason("");
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      aria-hidden
    >
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
            {detail?.id ?? selectedId}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-[var(--color-text-secondary)] hover:bg-zinc-100 hover:text-[var(--color-text-primary)]"
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
              <p className="text-sm text-[var(--color-text-secondary)]">불러오는 중...</p>
            </div>
          ) : !detail ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
              <p className="text-sm text-[var(--color-text-secondary)]">멤버 정보를 불러올 수 없습니다.</p>
              <button
                type="button"
                onClick={onClose}
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
                      sizes="96px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-[var(--color-text-muted)]">
                      {detail.nickname?.charAt(0)?.toUpperCase() ?? "?"}
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
                    {detail.nickname}
                  </h2>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    {detail.role === "ADMIN" ? "관리자" : "일반 회원"} ·{" "}
                    {ACCOUNT_STATUS_LABEL[detail.accountStatus ?? "ACTIVE"]}
                    {detail.warningCount > 0
                      ? ` · 경고 ${detail.warningCount}회`
                      : ""}
                  </p>
                </div>
              </div>

              {detail.accountStatus === "SUSPENDED" ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800">
                  <p className="font-semibold">일시 정지 중</p>
                  {detail.suspendedUntil ? (
                    <p className="mt-1">
                      해제 예정: {formatMemberDateTime(detail.suspendedUntil)}
                    </p>
                  ) : null}
                  {detail.suspendReason ? (
                    <p className="mt-1">사유: {detail.suspendReason}</p>
                  ) : null}
                </div>
              ) : null}

              <div className="grid w-full grid-cols-2 gap-4 rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 sm:grid-cols-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                    나만의 명반
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[var(--color-text-primary)]">
                    {detail.slideCount}개
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                    리뷰
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[var(--color-text-primary)]">
                    {detail.reviewCount}개
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                    좋아요
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[var(--color-text-primary)]">
                    {detail.favoriteCount}개
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                    슬라이드 표시
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[var(--color-text-primary)]">
                    {detail.hasUserSlide ? "표시됨" : "미표시"}
                  </p>
                </div>
              </div>

              <div className="w-full space-y-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                  정보
                </p>
                <div className="grid grid-cols-1 gap-x-4 gap-y-3 text-sm sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <p className="text-[10px] font-medium text-[var(--color-text-muted)]">
                      이름
                    </p>
                    <p className="break-words text-[var(--color-text-primary)]">{detail.name ?? "-"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-[var(--color-text-muted)]">
                      성별
                    </p>
                    <p className="text-[var(--color-text-primary)]">
                      {detail.gender
                        ? GENDER_LABEL[detail.gender] ?? detail.gender
                        : "-"}
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-[10px] font-medium text-[var(--color-text-muted)]">
                      가입일
                    </p>
                    <p className="text-[var(--color-text-primary)]">
                      {formatMemberDate(detail.createdAt)}
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-[10px] font-medium text-[var(--color-text-muted)]">
                      이메일
                    </p>
                    <p className="truncate text-[var(--color-text-primary)]">{detail.email}</p>
                  </div>
                </div>
              </div>

              {detail.slideAlbums.length > 0 && (
                <div className="w-full space-y-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
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
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="aspect-square bg-zinc-200" />
                        )}
                        <p className="truncate px-2 py-1 text-[10px] font-medium text-[var(--color-text-primary)]">
                          {album.title}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(detail.sanctions?.length ?? 0) > 0 ? (
                <div className="w-full space-y-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                    제재 이력
                  </p>
                  <ul className="max-h-40 space-y-2 overflow-y-auto rounded-xl border border-zinc-100 bg-zinc-50/50 p-3">
                    {detail.sanctions.map((item) => (
                      <li key={item.id} className="text-xs text-[var(--color-text-primary)]">
                        <p className="font-medium">
                          {SANCTION_ACTION_LABEL[item.action]} ·{" "}
                          {formatMemberDateTime(item.createdAt)}
                        </p>
                        <p className="mt-0.5 text-[var(--color-text-secondary)]">
                          {item.reason}
                          {item.suspendedUntil
                            ? ` · 해제 ${formatMemberDateTime(item.suspendedUntil)}`
                            : ""}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {detail.id !== currentUserId && (
                <div className="mt-auto space-y-3 border-t border-zinc-100 pt-4">
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] font-medium text-[var(--color-text-secondary)]">
                      역할:
                    </label>
                    <select
                      value={detail.role}
                      onChange={(e) =>
                        onRoleChange(
                          detail.id,
                          e.target.value as "USER" | "ADMIN"
                        )
                      }
                      disabled={isProcessing}
                      className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-[var(--color-text-primary)] disabled:opacity-50"
                    >
                      <option value="USER">일반 사용자</option>
                      <option value="ADMIN">관리자</option>
                    </select>
                  </div>

                  {canSanction ? (
                    <div className="space-y-2 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                        경고 / 일시 정지
                      </p>
                      <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="제재 사유"
                        rows={2}
                        className="w-full resize-none rounded-lg border border-zinc-200 px-3 py-2 text-xs outline-none focus:border-zinc-400"
                      />
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-medium text-[var(--color-text-muted)]">
                          정지 해제 일시
                        </label>
                        <input
                          type="datetime-local"
                          value={suspendUntil}
                          onChange={(e) => setSuspendUntil(e.target.value)}
                          className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs outline-none focus:border-zinc-400"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => void submitSanction("warn")}
                          disabled={isProcessing}
                          className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] font-medium text-amber-800 hover:bg-amber-100 disabled:opacity-50"
                        >
                          경고 부여
                        </button>
                        <button
                          type="button"
                          onClick={() => void submitSanction("suspend")}
                          disabled={isProcessing}
                          className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-1.5 text-[11px] font-medium text-orange-800 hover:bg-orange-100 disabled:opacity-50"
                        >
                          일시 정지
                        </button>
                        {detail.accountStatus === "SUSPENDED" ? (
                          <button
                            type="button"
                            onClick={() => void submitSanction("unsuspend")}
                            disabled={isProcessing}
                            className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-medium text-emerald-800 hover:bg-emerald-100 disabled:opacity-50"
                          >
                            정지 해제
                          </button>
                        ) : null}
                      </div>
                    </div>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => onDelete(detail.id)}
                    disabled={isProcessing}
                    className="w-full rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                  >
                    {isProcessing ? "처리 중..." : "계정 삭제 (재가입 차단)"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
