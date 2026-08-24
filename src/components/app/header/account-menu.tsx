"use client";
/** 헤더 계정 메뉴 */

import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useRef } from "react";
import { useClickOutside } from "@/src/hooks/use-click-outside";
import { profileSelf } from "@/src/lib/navigation/routes";
import { HeaderDropdownPanel } from "./header-dropdown-panel";
import { HeaderIconButton } from "./header-icon-button";
import { UserOutlineIcon } from "./user-outline-icon";

interface AccountMenuProps {
  nickname: string;
  profileImage: string | null;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export function AccountMenu({
  nickname,
  profileImage,
  isOpen,
  onToggle,
  onClose,
}: AccountMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, onClose, isOpen);

  return (
    <div className="relative" ref={ref}>
      <HeaderIconButton label="프로필 메뉴" expanded={isOpen} onClick={onToggle}>
        {profileImage ? (
          <Image
            src={profileImage}
            alt={nickname}
            width={30}
            height={30}
            sizes="30px"
            className="h-[30px] w-[30px] rounded-full border border-zinc-300 object-cover"
          />
        ) : (
          <UserOutlineIcon />
        )}
      </HeaderIconButton>

      {isOpen ? (
        <div className="absolute right-0 top-full z-50 mt-2 min-w-[9rem]">
          <HeaderDropdownPanel>
            <Link
              href={profileSelf()}
              onClick={onClose}
              className="block w-full px-4 py-3 text-sm font-medium text-[var(--color-text-primary)] hover:bg-zinc-50"
            >
              마이페이지
            </Link>
            <button
              type="button"
              onClick={() => {
                onClose();
                void signOut({ callbackUrl: "/" });
              }}
              className="block w-full px-4 py-3 text-left text-sm font-medium text-[var(--color-text-primary)] hover:bg-zinc-50"
            >
              로그아웃
            </button>
          </HeaderDropdownPanel>
        </div>
      ) : null}
    </div>
  );
}
