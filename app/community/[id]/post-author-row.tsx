"use client";

import Image from "next/image";
import { useState } from "react";
import { UserProfileModal } from "@/components/user-profile-modal";

interface PostAuthorRowProps {
  userId: string;
  nickname: string;
  profileImage: string | null;
  timeAgo: string;
  views: number;
  commentCount: number;
}

export function PostAuthorRow({
  userId,
  nickname,
  profileImage,
  timeAgo,
  views,
  commentCount,
}: PostAuthorRowProps) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleOpenProfileModal = () => {
    setSelectedUserId(userId);
    setIsProfileModalOpen(true);
  };

  const handleCloseProfileModal = () => {
    setIsProfileModalOpen(false);
    setSelectedUserId(null);
  };

  return (
    <div className="flex items-center gap-3 border-b border-zinc-100 pb-4 pt-2">
      <button
        type="button"
        onClick={handleOpenProfileModal}
        className="h-6 w-6 shrink-0 overflow-hidden rounded-md bg-zinc-100"
        aria-label={`${nickname} 프로필 보기`}
      >
        {profileImage ? (
          <Image
            src={profileImage}
            alt=""
            width={24}
            height={24}
            unoptimized
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-zinc-400">
            {nickname.charAt(0).toUpperCase()}
          </div>
        )}
      </button>

      <div className="flex flex-wrap items-center gap-2 text-[13px] text-zinc-500">
        <button
          type="button"
          onClick={handleOpenProfileModal}
          className="font-semibold text-zinc-900 hover:underline"
        >
          {nickname}
        </button>
        <span className="text-zinc-300">|</span>
        <span>{timeAgo}</span>
        <span className="text-zinc-300">|</span>
        <span>
          조회 수 <span className="text-zinc-900">{views}</span>
        </span>
        <span className="text-zinc-300">|</span>
        <span>
          댓글 <span className="font-medium text-red-500">{commentCount}</span>
        </span>
      </div>

      <UserProfileModal
        userId={selectedUserId}
        isOpen={isProfileModalOpen}
        onClose={handleCloseProfileModal}
      />
    </div>
  );
}
