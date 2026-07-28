"use client";
/** 관리자 회원 관리 - 상세 정보 패널 (모달) */

import Image from "next/image";
import { formatMemberDate, GENDER_LABEL, type MemberDetail } from "./types";

interface MemberDetailPanelProps {
  selectedId: string;
  detail: MemberDetail | null;
  isLoadingDetail: boolean;
  currentUserId: string | undefined;
  processingIds: Set<string>;
  onClose: () => void;
  onRoleChange: (memberId: string, newRole: "USER" | "ADMIN") => void;
  onDelete: (memberId: string) => void;
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
}: MemberDetailPanelProps) {
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
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            {detail?.id ?? selectedId}
          </p>
          <button
            type="button"
            onClick={onClose}
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
                      {formatMemberDate(detail.createdAt)}
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

              {detail.id !== currentUserId && (
                <div className="mt-auto space-y-3 border-t border-zinc-100 pt-4">
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] font-medium text-zinc-500">
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
                      disabled={processingIds.has(detail.id)}
                      className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-700 disabled:opacity-50"
                    >
                      <option value="USER">일반 사용자</option>
                      <option value="ADMIN">관리자</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDelete(detail.id)}
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
  );
}
