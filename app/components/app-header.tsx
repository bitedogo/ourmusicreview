"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export function AppHeader() {
  const { data: session, status } = useSession();
  const nickname = session?.user?.name ?? null;
  const profileImage = (session?.user as { profileImage?: string | null })?.profileImage ?? null;
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-3 sm:px-10">
        {/* 왼쪽: 로고 + 게시판 메뉴 */}
        <div className="flex items-center gap-6 sm:gap-8">
          <Link
            href="/"
            className="shrink-0 text-lg font-semibold tracking-[0.2em] text-zinc-900"
          >
            ORU
          </Link>
          <nav className="flex items-center gap-5 text-xs text-zinc-600 sm:gap-8">
            {/* 개별 게시판 */}
            <Link
              href="/boards/domestic"
              className="hover:text-zinc-900"
            >
              국내게시판
            </Link>
            <Link
              href="/boards/overseas"
              className="hover:text-zinc-900"
            >
              해외게시판
            </Link>
            <Link
              href="/boards/market"
              className="hover:text-zinc-900"
            >
              장터게시판
            </Link>
            <Link
              href="/boards/workroom"
              className="hover:text-zinc-900"
            >
              워크룸
            </Link>

            {session?.user?.role === "ADMIN" && (
              <div className="relative group flex items-center">
                <span className="cursor-default font-bold text-zinc-600 hover:text-zinc-900">
                  관리자
                </span>
                <div className="absolute top-full left-0 hidden group-hover:block animate-in fade-in zoom-in-95 duration-100">
                  <div className="min-w-[9rem] overflow-hidden rounded-lg border border-zinc-200 bg-white py-1 shadow-lg">
                    <Link
                      href="/admin/reviews"
                      className="block w-full px-4 py-3 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
                    >
                      리뷰 승인 관리
                    </Link>
                    <Link
                      href="/admin/members"
                      className="block w-full px-4 py-3 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
                    >
                      멤버 관리
                    </Link>
                    <Link
                      href="/admin/reports"
                      className="block w-full px-4 py-3 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
                    >
                      신고 관리
                    </Link>
                    <Link
                      href="/admin/albums"
                      className="block w-full px-4 py-3 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
                    >
                      오늘의 앨범
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </nav>
        </div>

        {/* 우측 인증 영역 */}
        <nav className="flex shrink-0 items-center gap-3 text-xs">
            {status === "loading" ? (
              <span className="text-zinc-500">확인 중...</span>
            ) : nickname ? (
              <div className="relative group flex items-center gap-2 cursor-pointer py-1 pr-1">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={nickname}
                    className="h-6 w-6 rounded-full border border-zinc-200 object-cover"
                  />
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full border border-zinc-200 bg-zinc-100 text-[10px] font-semibold text-zinc-600">
                    {nickname.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-xs text-zinc-700 font-medium">
                  {nickname}님
                </span>

                {/* 마우스 호버 시 나타나는 드롭다운 메뉴 (hover 유지를 위해 상단 투명 영역 추가) */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 hidden group-hover:block animate-in fade-in zoom-in-95 duration-100">
                  <div className="min-w-[8rem] overflow-hidden rounded-lg border border-zinc-200 bg-white py-1 shadow-lg">
                    <Link
                      href="/profile"
                      className="block w-full px-4 py-3 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
                    >
                      마이페이지
                    </Link>
                    <button
                      type="button"
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="block w-full px-4 py-3 text-left text-sm font-medium text-zinc-800 hover:bg-zinc-50"
                    >
                      로그아웃
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="font-medium text-zinc-600 hover:text-zinc-900"
              >
                로그인
              </Link>
            )}
        </nav>
      </div>
    </header>
  );
}

