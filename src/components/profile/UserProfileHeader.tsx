"use client";
/** 타인 유저 프로필 뷰 - 헤더(아바타/닉네임/평점) 영역 */

import Image from "next/image";
import { GENDER_LABEL, ProfileReviewItem } from "./profile-types";
import { ProfileRatingGauge } from "./ProfileRatingGauge";
import { UserProfile } from "./profile-view-types";

interface UserProfileHeaderProps {
  userProfile: UserProfile;
  userReviews: ProfileReviewItem[];
  ratingHidden: boolean;
}

export function UserProfileHeader({ userProfile, userReviews, ratingHidden }: UserProfileHeaderProps) {
  return (
    <div className="mb-4 flex flex-col items-start justify-between gap-4 sm:flex-row">
      <div className="flex items-center gap-4">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-gray-200">
          <Image
            src={userProfile.profileImage || "/default-avatar.png"}
            alt={userProfile.nickname}
            fill
            sizes="80px"
            className="object-cover"
          />
        </div>
        <div>
          <p className="text-xl font-semibold text-gray-900">{userProfile.nickname}</p>
          {userProfile.email && <p className="text-sm text-gray-500">{userProfile.email}</p>}
          <p className="text-xs text-gray-500">
            가입일: {new Date(userProfile.createdAt).toLocaleDateString("ko-KR")}
          </p>
          <p className="mt-1 text-sm font-medium text-gray-700">
            성별:{" "}
            <span className="font-semibold text-gray-900">
              {GENDER_LABEL[userProfile.gender || "NONE"]}
            </span>
          </p>
        </div>
      </div>
      {!ratingHidden ? (
        <ProfileRatingGauge
          reviews={userReviews}
          averageRating={userProfile.averageRating}
        />
      ) : (
        <div className="flex w-[190px] shrink-0 items-center justify-center rounded-lg border border-dashed border-zinc-200 bg-zinc-50 p-4">
          <p className="text-xs text-zinc-500">평균 평점 비공개</p>
        </div>
      )}
    </div>
  );
}
