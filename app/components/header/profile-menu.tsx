"use client";

import Link from "next/link";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { useRef, useState } from "react";
import { useClickOutside } from "@/src/hooks/use-click-outside";
import { HeaderDropdownPanel } from "./header-dropdown-panel";
import { UserOutlineIcon } from "./user-outline-icon";

export function ProfileMenu() {
  const { data: session, status } = useSession();
  const nickname = session?.user?.name ?? null;
  const profileImage =
    session?.user?.profileImage ?? session?.user?.image ?? null;
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useClickOutside(profileRef, () => setProfileOpen(false), profileOpen);

  if (status === "loading") {
    return <span className="text-xs text-zinc-400">...</span>;
  }

  if (nickname) {
    return (
      <div className="relative" ref={profileRef}>
        <button
          type="button"
          aria-label="프로필 메뉴"
          aria-expanded={profileOpen}
          onClick={() => setProfileOpen((prev) => !prev)}
          className="flex items-center justify-center rounded-full text-zinc-700 transition hover:text-[var(--color-accent)]"
        >
          {profileImage ? (
            <Image
              src={profileImage}
              alt={nickname}
              width={24}
              height={24}
              unoptimized
              className="h-6 w-6 rounded-full border border-zinc-300 object-cover"
            />
          ) : (
            <UserOutlineIcon />
          )}
        </button>

        {profileOpen && (
          <div className="absolute right-0 top-full z-50 mt-2 min-w-[9rem]">
            <HeaderDropdownPanel>
              <Link
                href="/profile"
                onClick={() => setProfileOpen(false)}
                className="block w-full px-4 py-3 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
              >
                마이페이지
              </Link>
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false);
                  signOut({ callbackUrl: "/" });
                }}
                className="block w-full px-4 py-3 text-left text-sm font-medium text-zinc-800 hover:bg-zinc-50"
              >
                로그아웃
              </button>
            </HeaderDropdownPanel>
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href="/auth/signin"
      aria-label="로그인"
      className="flex items-center justify-center text-zinc-700 transition hover:text-[var(--color-accent)]"
    >
      <UserOutlineIcon />
    </Link>
  );
}
