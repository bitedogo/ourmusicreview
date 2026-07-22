/** 프로필 헤더 — 내정보 · 평균 평점 (데스크톱/모바일) */

import Link from "next/link";
import { EditPencilIcon } from "./EditPencilIcon";
import { PrivateSectionMessage } from "./PrivateSectionMessage";
import { ProfileAvatarRing } from "./ProfileAvatarRing";
import { ProfilePrivacyToggle } from "./ProfilePrivacyToggle";
import { ProfileRatingEmptyState } from "./ProfileRatingEmptyState";
import { ProfileRatingGauge } from "./ProfileRatingGauge";
import { GENDER_LABEL, type ProfileReviewItem } from "./profile-types";
import {
  PROFILE_HEADER_CARD_CLASS,
  PROFILE_SECTION_INSET,
} from "./profile-section-styles";

interface ProfileHeaderSectionProps {
  isOwner: boolean;
  profilePreviewHref: string;
  profileImage: string | null;
  nickname: string;
  name: string | null;
  gender: "MALE" | "FEMALE" | "NONE" | null;
  createdAtText: string;
  showReviewGauge: boolean;
  hasRatingData: boolean;
  gaugeReviews: ProfileReviewItem[];
  averageRating?: number;
  displayRating: number;
  listenerLabel: string;
  showRatingPublic: boolean;
  isSavingPrivacy?: boolean;
  onRatingPrivacyChange?: (value: boolean) => void;
}

export function ProfileHeaderSection({
  isOwner,
  profilePreviewHref,
  profileImage,
  nickname,
  name,
  gender,
  createdAtText,
  showReviewGauge,
  hasRatingData,
  gaugeReviews,
  averageRating,
  displayRating,
  listenerLabel,
  showRatingPublic,
  isSavingPrivacy = false,
  onRatingPrivacyChange,
}: ProfileHeaderSectionProps) {
  return (
    <div className={PROFILE_HEADER_CARD_CLASS}>
      <ProfileHeaderDesktop
        isOwner={isOwner}
        profilePreviewHref={profilePreviewHref}
        profileImage={profileImage}
        nickname={nickname}
        name={name}
        gender={gender}
        createdAtText={createdAtText}
        showReviewGauge={showReviewGauge}
        hasRatingData={hasRatingData}
        gaugeReviews={gaugeReviews}
        averageRating={averageRating}
        displayRating={displayRating}
        listenerLabel={listenerLabel}
        showRatingPublic={showRatingPublic}
        isSavingPrivacy={isSavingPrivacy}
        onRatingPrivacyChange={onRatingPrivacyChange}
      />
      <ProfileHeaderMobile
        isOwner={isOwner}
        profilePreviewHref={profilePreviewHref}
        profileImage={profileImage}
        nickname={nickname}
        name={name}
        gender={gender}
        createdAtText={createdAtText}
        showReviewGauge={showReviewGauge}
        hasRatingData={hasRatingData}
        gaugeReviews={gaugeReviews}
        averageRating={averageRating}
        listenerLabel={listenerLabel}
        showRatingPublic={showRatingPublic}
        isSavingPrivacy={isSavingPrivacy}
        onRatingPrivacyChange={onRatingPrivacyChange}
      />
    </div>
  );
}

function ProfileHeaderDesktop({
  isOwner,
  profilePreviewHref,
  profileImage,
  nickname,
  name,
  gender,
  createdAtText,
  showReviewGauge,
  hasRatingData,
  gaugeReviews,
  averageRating,
  displayRating,
  listenerLabel,
  showRatingPublic,
  isSavingPrivacy,
  onRatingPrivacyChange,
}: Omit<ProfileHeaderSectionProps, "displayRating"> & {
  displayRating: number;
}) {
  return (
    <div className="hidden h-[484px] lg:grid lg:grid-cols-[minmax(0,420px)_1px_minmax(0,1fr)]">
      <div className="relative flex h-full flex-col items-center justify-center px-10">
        <ProfileAvatarRing
          size={180}
          profileImage={profileImage}
          nickname={nickname}
          href={profilePreviewHref}
        />

        <p className="mt-4 text-[24px] font-normal leading-[29px] text-black">
          {nickname}
        </p>

        <dl className="mt-8 w-full max-w-[280px] space-y-[26px] text-[14px] leading-[17px]">
          {isOwner && (
            <div className="grid grid-cols-[55px_1fr] gap-x-[20px]">
              <dt className="text-[#7F7F7F]">이름</dt>
              <dd className="truncate text-black">{name ?? "-"}</dd>
            </div>
          )}
          <div className="grid grid-cols-[55px_1fr] gap-x-[20px]">
            <dt className="text-[#7F7F7F]">성별</dt>
            <dd className="text-black">
              {gender ? GENDER_LABEL[gender] ?? gender : "-"}
            </dd>
          </div>
          <div className="grid grid-cols-[55px_1fr] items-center gap-x-[20px]">
            <dt className="text-[#7F7F7F]">가입일</dt>
            <dd className="truncate text-black">{createdAtText}</dd>
          </div>
        </dl>

        {isOwner && (
          <Link
            href="/profile/edit"
            aria-label="내 정보 수정"
            className="absolute bottom-[62px] right-10 inline-flex h-[24px] w-[24px] items-center justify-center overflow-visible"
          >
            <EditPencilIcon />
          </Link>
        )}
      </div>

      <div className="my-7 w-px self-stretch bg-[#E3E3E3]" aria-hidden />

      <div className="relative flex h-full min-w-0 flex-col px-8 py-10 pr-10">
        {isOwner && onRatingPrivacyChange && (
          <div className="absolute right-8 top-7">
            <ProfilePrivacyToggle
              isPublic={showRatingPublic}
              disabled={isSavingPrivacy}
              onChange={onRatingPrivacyChange}
            />
          </div>
        )}

        <ProfileRatingPanel
          isOwner={isOwner}
          showReviewGauge={showReviewGauge}
          hasRatingData={hasRatingData}
          gaugeReviews={gaugeReviews}
          averageRating={averageRating}
          displayRating={displayRating}
          listenerLabel={listenerLabel}
          variant="desktop"
        />
      </div>
    </div>
  );
}

function ProfileHeaderMobile({
  isOwner,
  profilePreviewHref,
  profileImage,
  nickname,
  name,
  gender,
  createdAtText,
  showReviewGauge,
  hasRatingData,
  gaugeReviews,
  averageRating,
  listenerLabel,
  showRatingPublic,
  isSavingPrivacy,
  onRatingPrivacyChange,
}: Omit<ProfileHeaderSectionProps, "displayRating">) {
  return (
    <div className="flex w-full flex-col items-center justify-center gap-5 py-[25px] lg:hidden">
      <ProfileAvatarRing
        size={100}
        profileImage={profileImage}
        nickname={nickname}
        href={profilePreviewHref}
      />

      <p className="text-[24px] font-normal leading-[29px] text-black">{nickname}</p>

      <dl className="flex w-[165px] flex-col gap-[15px] pt-2.5 text-[11px] leading-[13px]">
        {isOwner && (
          <div className="flex gap-0">
            <dt className="w-[55px] shrink-0 text-[#7F7F7F]">이름</dt>
            <dd className="min-w-0 truncate text-black">{name ?? "-"}</dd>
          </div>
        )}
        <div className="flex">
          <dt className="w-[55px] shrink-0 text-[#7F7F7F]">성별</dt>
          <dd className="text-black">
            {gender ? GENDER_LABEL[gender] ?? gender : "-"}
          </dd>
        </div>
        <div className="flex">
          <dt className="w-[55px] shrink-0 text-[#7F7F7F]">가입일</dt>
          <dd className="min-w-0 truncate text-black">{createdAtText}</dd>
        </div>
      </dl>

      {isOwner && (
        <div className="flex h-5 w-full items-center justify-end px-[27px]">
          <Link
            href="/profile/edit"
            aria-label="내 정보 수정"
            className="inline-flex h-5 w-5 items-center justify-center"
          >
            <EditPencilIcon size={20} />
          </Link>
        </div>
      )}

      <div className={`w-full shrink-0 ${PROFILE_SECTION_INSET}`}>
        <div className="h-px w-full bg-[#E3E3E3]" aria-hidden />
      </div>

      {isOwner && onRatingPrivacyChange && (
        <div className="flex h-[25px] w-full items-center justify-center px-[27px]">
          <ProfilePrivacyToggle
            size="sm"
            isPublic={showRatingPublic}
            disabled={isSavingPrivacy}
            onChange={onRatingPrivacyChange}
          />
        </div>
      )}

      <ProfileRatingPanel
        isOwner={isOwner}
        showReviewGauge={showReviewGauge}
        hasRatingData={hasRatingData}
        gaugeReviews={gaugeReviews}
        averageRating={averageRating}
        listenerLabel={listenerLabel}
        variant="mobile"
      />
    </div>
  );
}

function ProfileRatingPanel({
  isOwner,
  showReviewGauge,
  hasRatingData,
  gaugeReviews,
  averageRating,
  displayRating,
  listenerLabel,
  variant,
}: {
  isOwner: boolean;
  showReviewGauge: boolean;
  hasRatingData: boolean;
  gaugeReviews: ProfileReviewItem[];
  averageRating?: number;
  displayRating?: number;
  listenerLabel: string;
  variant: "desktop" | "mobile";
}) {
  if (!showReviewGauge) {
    return (
      <div
        className={
          variant === "desktop"
            ? "flex flex-1 items-center justify-center"
            : "px-6 py-8"
        }
      >
        <PrivateSectionMessage />
      </div>
    );
  }

  if (!hasRatingData) {
    return (
      <ProfileRatingEmptyState
        className={variant === "mobile" ? "px-2 py-2" : "min-h-0"}
      />
    );
  }

  if (variant === "desktop") {
    return (
      <>
        <p className="text-[24px] font-extrabold leading-[29px] text-[#43A7B2]">
          Average Rating
        </p>
        <p
          className="font-extrabold text-[#FFA310]"
          style={{ fontSize: 75, lineHeight: "90px" }}
        >
          {displayRating!.toFixed(1)}
        </p>
        <div className="mt-1 w-full max-w-[567px]">
          <ProfileRatingGauge
            reviews={gaugeReviews}
            averageRating={!isOwner ? averageRating : undefined}
            barOnly
          />
        </div>
        <div className="mt-2 flex w-full max-w-[567px] items-center justify-between">
          <span className="text-[15px] font-extralight leading-[18px] text-[#8F8F8F]">
            Born Hater
          </span>
          <span className="text-[15px] font-extralight leading-[18px] text-[#8F8F8F]">
            Sound Lover
          </span>
        </div>
        <p className="mt-auto pb-2 text-center text-[32px] font-extrabold leading-[38px] text-[#43A7B2]">
          {listenerLabel}
        </p>
      </>
    );
  }

  return (
    <>
      <div className="flex h-[178px] w-full items-center justify-center">
        <ProfileRatingGauge
          reviews={gaugeReviews}
          averageRating={!isOwner ? averageRating : undefined}
          variant="mobileVertical"
        />
      </div>
      <p className="w-[185px] text-center text-[24px] font-extrabold leading-[29px] text-[#43A7B2]">
        {listenerLabel}
      </p>
    </>
  );
}
