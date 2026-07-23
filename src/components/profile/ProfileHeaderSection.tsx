/** 프로필 헤더 — 내정보 · 평균 평점 (데스크톱/모바일) */

import { PrivateSectionMessage } from "./PrivateSectionMessage";
import { ProfileIdentityBlock } from "./ProfileIdentityBlock";
import { ProfilePrivacyToggle } from "./ProfilePrivacyToggle";
import { ProfileRatingEmptyState } from "./ProfileRatingEmptyState";
import { ProfileRatingGauge } from "./ProfileRatingGauge";
import type { ProfileReviewItem } from "./profile-types";
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

export function ProfileHeaderSection(props: ProfileHeaderSectionProps) {
  return (
    <div className={PROFILE_HEADER_CARD_CLASS}>
      <ProfileHeaderDesktop {...props} />
      <ProfileHeaderMobile {...props} />
    </div>
  );
}

function ProfileHeaderDesktop(props: ProfileHeaderSectionProps) {
  const {
    isOwner,
    showReviewGauge,
    hasRatingData,
    gaugeReviews,
    averageRating,
    displayRating,
    listenerLabel,
    showRatingPublic,
    isSavingPrivacy = false,
    onRatingPrivacyChange,
  } = props;

  return (
    <div className="hidden h-[484px] lg:grid lg:grid-cols-[minmax(0,420px)_1px_minmax(0,1fr)]">
      <ProfileIdentityBlock variant="desktop" {...identityProps(props)} />

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

function ProfileHeaderMobile(props: ProfileHeaderSectionProps) {
  const {
    isOwner,
    showReviewGauge,
    hasRatingData,
    gaugeReviews,
    averageRating,
    listenerLabel,
    showRatingPublic,
    isSavingPrivacy = false,
    onRatingPrivacyChange,
  } = props;

  return (
    <div className="flex w-full flex-col items-center justify-center gap-5 py-[25px] lg:hidden">
      <ProfileIdentityBlock variant="mobile" {...identityProps(props)} />

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

function identityProps(props: ProfileHeaderSectionProps) {
  return {
    isOwner: props.isOwner,
    profilePreviewHref: props.profilePreviewHref,
    profileImage: props.profileImage,
    nickname: props.nickname,
    name: props.name,
    gender: props.gender,
    createdAtText: props.createdAtText,
  };
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
      <div className="flex min-h-[178px] w-full items-center justify-center px-4">
        <ProfileRatingGauge
          reviews={gaugeReviews}
          averageRating={!isOwner ? averageRating : undefined}
          variant="mobileVertical"
        />
      </div>
      <p className="text-center text-[24px] font-extrabold leading-[29px] text-[#43A7B2]">
        {listenerLabel}
      </p>
    </>
  );
}
