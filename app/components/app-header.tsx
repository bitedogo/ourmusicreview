"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";

const ALBUM_REVIEW_LINK = { href: "/reviews", label: "앨범 리뷰" } as const;

const BOARD_LINKS = [
  { href: "/boards/domestic", label: "국내게시판" },
  { href: "/boards/overseas", label: "해외게시판" },
  { href: "/boards/market", label: "장터게시판" },
  { href: "/boards/workroom", label: "워크룸" },
] as const;

const NAV_LINKS = [ALBUM_REVIEW_LINK, ...BOARD_LINKS];

const ADMIN_LINKS = [
  { href: "/admin/reviews", label: "리뷰 승인 관리" },
  { href: "/admin/members", label: "멤버 관리" },
  { href: "/admin/reports", label: "신고 관리" },
  { href: "/admin/albums", label: "오늘의 앨범" },
  { href: "/admin/featured-slide", label: "슬라이드바 편집" },
  { href: "/admin/faq", label: "FAQ 관리" },
] as const;

export function AppHeader() {
  const { data: session, status } = useSession();
  const nickname = session?.user?.name ?? null;
  const profileImage = (session?.user as { profileImage?: string | null })?.profileImage ?? null;
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) {
        setMenuOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfileOpen(false);
      }
    }
    if (menuOpen || profileOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [menuOpen, profileOpen]);

  const logoLink = (
    <Link href="/" className="shrink-0 flex items-center gap-2">
      <Image
        src="/oru-num6.png"
        alt="ORU 로고"
        width={28}
        height={28}
        className="h-7 w-auto"
        priority
      />
    </Link>
  );

  return (
    <header className="fixed left-0 right-0 top-0 z-50 w-full border-b border-zinc-200 bg-white/95 backdrop-blur">
      <div className="mx-auto grid w-[956px] max-w-full grid-cols-3 items-center gap-4 px-6 py-5 sm:px-10 sm:py-6 md:flex md:justify-between">
        <div className="flex items-center gap-4 sm:gap-6 md:gap-6" ref={menuRef}>
          <div className="flex md:hidden items-center">
            <button
              type="button"
              aria-label="메뉴 열기"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex flex-col justify-center gap-2 rounded p-2.5 text-zinc-700 hover:bg-zinc-100"
            >
              <span className="block h-0.5 w-6 rounded-full bg-current" />
              <span className="block h-0.5 w-6 rounded-full bg-current" />
              <span className="block h-0.5 w-6 rounded-full bg-current" />
            </button>
          </div>

          <div className="hidden md:flex items-center gap-5 text-sm text-zinc-600">
            {logoLink}
            <nav className="flex items-center gap-5">
              {NAV_LINKS.map(({ href, label }) => (
                <Link key={href} href={href} className="hover:text-zinc-900">
                  {label}
                </Link>
              ))}
              {session?.user?.role === "ADMIN" && (
                <div className="relative group flex items-center">
                  <span className="cursor-default font-bold text-zinc-600 hover:text-zinc-900">
                    관리자
                  </span>
                  <div className="absolute top-full left-0 hidden group-hover:block animate-in fade-in zoom-in-95 duration-100">
                    <div className="min-w-[10rem] overflow-hidden rounded-lg border border-zinc-200 bg-white py-1.5 shadow-lg">
                      {ADMIN_LINKS.map(({ href, label }) => (
                        <Link
                          key={href}
                          href={href}
                          className="block w-full px-4 py-3 text-base font-medium text-zinc-800 hover:bg-zinc-50"
                        >
                          {label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </nav>
          </div>
        </div>

        <div className="flex justify-center md:hidden">
          {logoLink}
        </div>

        <nav className="flex shrink-0 items-center justify-end gap-3 text-sm">
            {status === "loading" ? (
              <span className="text-zinc-500">확인 중...</span>
            ) : nickname ? (
              <div className="relative flex items-center" ref={profileRef}>
                <button
                  type="button"
                  aria-label="프로필 메뉴"
                  aria-expanded={profileOpen}
                  onClick={() => setProfileOpen((prev) => !prev)}
                  className="flex items-center gap-2 rounded-lg py-1 pr-1 text-left hover:bg-zinc-100 md:py-1 md:pr-1"
                >
                  {profileImage ? (
                    <Image
                      src={profileImage}
                      alt={nickname}
                      width={32}
                      height={32}
                      unoptimized
                      className="h-8 w-8 rounded-full border border-zinc-200 object-cover"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-zinc-100 text-xs font-semibold text-zinc-600">
                      {nickname.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm text-zinc-700 font-medium">
                    {nickname}님
                  </span>
                </button>

                {profileOpen && (
                  <div className="absolute top-full left-1/2 z-50 -translate-x-1/2 animate-in fade-in zoom-in-95 duration-100">
                    <div className="min-w-[9rem] overflow-hidden rounded-lg border border-zinc-200 bg-white py-1.5 shadow-lg">
                      <Link
                        href="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="block w-full px-4 py-3 text-base font-medium text-zinc-800 hover:bg-zinc-50"
                      >
                        마이페이지
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setProfileOpen(false);
                          signOut({ callbackUrl: "/" });
                        }}
                        className="block w-full px-4 py-3 text-left text-base font-medium text-zinc-800 hover:bg-zinc-50"
                      >
                        로그아웃
                      </button>
                    </div>
                  </div>
                )}
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

      {menuOpen && (
        <div className="absolute left-0 right-0 top-full z-40 border-b border-zinc-200 bg-white shadow-lg md:hidden">
          <nav className="mx-auto w-[956px] max-w-full px-6 py-4 sm:px-10">
            <ul className="space-y-1">
              {NAV_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-lg px-3 py-3 text-base font-medium text-zinc-800 hover:bg-zinc-50"
                  >
                    {label}
                  </Link>
                </li>
              ))}
              {session?.user?.role === "ADMIN" && (
                <>
                  <li className="mt-2 border-t border-zinc-100 pt-2">
                    <span className="block px-3 py-1.5 text-sm font-bold uppercase tracking-wider text-zinc-400">
                      관리자
                    </span>
                  </li>
                  {ADMIN_LINKS.map(({ href, label }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        onClick={() => setMenuOpen(false)}
                        className="block rounded-lg px-3 py-3 text-base font-medium text-zinc-800 hover:bg-zinc-50"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </>
              )}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}

