"use client";

/** 마이페이지 프로필 헤더·활동·명반 */

import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";
import { getUserProfilePath } from "./user-profile-view";
import {
  ProfilePrivacySettings,
  ProfileReviewItem,
  ProfileFavoriteItem,
  ProfileMasterpieceItem,
  GENDER_LABEL,
} from "./profile-types";
import { PrivateSectionMessage } from "./PrivateSectionMessage";
import {
  ProfileRatingGauge,
  useAverageRating,
} from "./ProfileRatingGauge";
import { ActivityInfoTip } from "./ProfileInfoTips";
import { ProfilePrivacyToggle } from "./ProfilePrivacyToggle";
import { ProfileSectionHeader } from "./ProfileSectionHeader";
import {
  PROFILE_SECTION_CARD,
  PROFILE_SECTION_INSET,
} from "./profile-section-styles";
import { MasterpiecesReadOnlyGrid } from "./masterpiece/MasterpiecesReadOnlyGrid";

export type {
  ProfilePrivacySettings,
  ProfileReviewItem,
  ProfileFavoriteItem,
  ProfileMasterpieceItem,
} from "./profile-types";

/** 섹션 카드 공통 스타일 — profile-section-styles.ts 참고 */
const SECTION_CARD = PROFILE_SECTION_CARD;
const SECTION_INSET = PROFILE_SECTION_INSET;

export interface ProfilePageContentProps {
  mode: "owner" | "viewer";
  pageTitle: string;
  headerAction?: ReactNode;
  userId: string;
  nickname: string;
  name: string | null;
  gender: "MALE" | "FEMALE" | "NONE" | null;
  role: "USER" | "ADMIN" | null;
  createdAtText: string;
  profileImage: string | null;
  privacy: ProfilePrivacySettings;
  onPrivacyChange?: (key: keyof ProfilePrivacySettings, value: boolean) => void;
  isSavingPrivacy?: boolean;
  reviews: ProfileReviewItem[];
  isLoadingReviews: boolean;
  reviewsHidden?: boolean;
  totalReviewCount?: number;
  ratingHidden?: boolean;
  averageRating?: number;
  favoriteAlbums: ProfileFavoriteItem[];
  isLoadingFavorites: boolean;
  favoritesHidden?: boolean;
  masterpieces: ProfileMasterpieceItem[];
  isLoadingMasterpieces: boolean;
  masterpiecesHidden?: boolean;
  masterpiecesSection?: ReactNode;
  reviewsAllHref?: string;
  favoritesAllHref?: string;
  activityStats?: {
    postCount: number;
    commentCount: number;
    likedPostCount: number;
  };
}

export function ProfilePageContent(props: ProfilePageContentProps) {
  const {
    mode,
    pageTitle,
    headerAction,
    userId,
    nickname,
    name,
    gender,
    role: _role,
    createdAtText,
    profileImage,
    privacy,
    onPrivacyChange,
    isSavingPrivacy = false,
    reviews,
    isLoadingReviews,
    reviewsHidden = false,
    totalReviewCount,
    ratingHidden = false,
    averageRating,
    favoriteAlbums,
    isLoadingFavorites,
    favoritesHidden = false,
    masterpieces,
    isLoadingMasterpieces,
    masterpiecesHidden = false,
    masterpiecesSection,
    reviewsAllHref,
    favoritesAllHref,
    activityStats,
  } = props;

  const isOwner = mode === "owner";
  const profilePreviewHref = isOwner ? "/profile" : getUserProfilePath(userId);
  const visibleReviews = isOwner || !reviewsHidden ? reviews : [];
  const visibleFavorites = isOwner || !favoritesHidden ? favoriteAlbums : [];
  const visibleMasterpieces = isOwner || !masterpiecesHidden ? masterpieces : [];
  const showReviewGauge = isOwner || !ratingHidden;
  const gaugeReviews = isOwner ? reviews : visibleReviews;
  const reviewCount = totalReviewCount ?? reviews.length;
  const favoriteCount = favoriteAlbums.length;
  const { displayRating, listenerLabel, hasRatingData } = useAverageRating(
    gaugeReviews,
    !isOwner ? averageRating : undefined
  );

  const reviewCovers = visibleReviews
    .map((r) => r.album?.imageUrl)
    .filter((url): url is string => Boolean(url))
    .slice(0, 3);
  const favoriteCovers = visibleFavorites
    .map((f) => f.album?.imageUrl)
    .filter((url): url is string => Boolean(url))
    .slice(0, 3);

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-[1100px] px-3 pb-6 pt-[var(--profile-menu-title-gap)] sm:px-6 sm:pb-8">
        <div className="mb-[var(--profile-title-section-gap)] flex items-center justify-between gap-4">
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900 md:text-2xl">
            {pageTitle}
          </h1>
          {headerAction}
        </div>

        <div className="flex flex-col gap-[var(--profile-section-gap)]">
        {/* ========== 1. 프로필 헤더 (내정보) ========== */}
        <div
          className={`${SECTION_CARD} max-lg:bg-[#FEFEFE] max-lg:shadow-[0px_3px_3px_rgba(0,0,0,0.25)]`}
        >
          {/* Desktop */}
          <div className="hidden h-[484px] lg:grid lg:grid-cols-[minmax(0,420px)_1px_minmax(0,1fr)]">
            {/* 좌: 아바타 · 기본 정보 */}
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

            {/* 우: Average Rate (가로 게이지) */}
            <div className="relative flex h-full min-w-0 flex-col px-8 py-10 pr-10">
              {isOwner && onPrivacyChange && (
                <div className="absolute right-8 top-7">
                  <ProfilePrivacyToggle
                    isPublic={privacy.showRatingPublic}
                    disabled={isSavingPrivacy}
                    onChange={(value) => onPrivacyChange("showRatingPublic", value)}
                  />
                </div>
              )}

              {showReviewGauge && hasRatingData ? (
                <>
                  <p className="text-[24px] font-extrabold leading-[29px] text-[#43A7B2]">
                    Average Rate
                  </p>
                  <p
                    className="font-extrabold text-[#FFA310]"
                    style={{ fontSize: 75, lineHeight: "90px" }}
                  >
                    {displayRating.toFixed(1)}
                  </p>
                  <div className="mt-1 w-full max-w-[565px]">
                    <ProfileRatingGauge
                      reviews={gaugeReviews}
                      averageRating={!isOwner ? averageRating : undefined}
                      barOnly
                    />
                  </div>
                  <div className="mt-2 flex w-full max-w-[565px] items-center justify-between">
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
              ) : showReviewGauge ? (
                <div className="flex flex-1 items-center justify-center">
                  <p className="text-center text-sm text-zinc-400">
                    리뷰를 작성하면 평균 평점이 표시됩니다.
                  </p>
                </div>
              ) : (
                <div className="flex flex-1 items-center justify-center">
                  <PrivateSectionMessage />
                </div>
              )}
            </div>
          </div>

          {/* Mobile — Frame 23 세로 스택 */}
          <div className="flex w-full flex-col items-center justify-center gap-5 py-[25px] lg:hidden">
            <ProfileAvatarRing
              size={100}
              profileImage={profileImage}
              nickname={nickname}
              href={profilePreviewHref}
            />

            <p className="text-[24px] font-normal leading-[29px] text-black">
              {nickname}
            </p>

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

            <div className="h-px w-[280px] max-w-[calc(100%-28px)] bg-[#E3E3E3]" aria-hidden />

            {isOwner && onPrivacyChange && (
              <div className="flex h-[25px] w-full items-center justify-center px-[27px]">
                <ProfilePrivacyToggle
                  size="sm"
                  isPublic={privacy.showRatingPublic}
                  disabled={isSavingPrivacy}
                  onChange={(value) => onPrivacyChange("showRatingPublic", value)}
                />
              </div>
            )}

            {showReviewGauge && hasRatingData ? (
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
            ) : showReviewGauge ? (
              <p className="px-6 py-8 text-center text-sm text-zinc-400">
                리뷰를 작성하면 평균 평점이 표시됩니다.
              </p>
            ) : (
              <div className="px-6 py-8">
                <PrivateSectionMessage />
              </div>
            )}
          </div>
        </div>

        {/* ========== 2. 나의 활동 ========== */}
        {isOwner && (
          <section className={`${SECTION_CARD} !overflow-visible lg:h-[530px]`}>
            {/* Header */}
            <div
              className={`${SECTION_INSET} pt-10 lg:absolute lg:left-[52px] lg:top-[40px] lg:z-10 lg:px-0 lg:pt-0`}
            >
              <div className="flex items-center gap-[10px]">
                <h2 className="text-[15px] font-normal leading-[18px] text-black">나의 활동</h2>
                <ActivityInfoTip />
              </div>
              <div className="mb-8 mt-6 h-px w-full bg-[#E3E3E3] lg:hidden" aria-hidden />
            </div>
            <div
              className="hidden h-px bg-[#E3E3E3] lg:absolute lg:left-[52px] lg:right-[52px] lg:top-[78px] lg:block"
              aria-hidden
            />

            {/* Frame 101 — collection cards */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-[46px] px-5 lg:absolute lg:left-1/2 lg:top-[117px] lg:mt-0 lg:w-[578px] lg:-translate-x-1/2 lg:flex-nowrap lg:p-[5px]">
              <ActivityCollectionCard
                title="My Reviews"
                count={reviewCount}
                covers={reviewCovers}
                href={reviewsAllHref ?? "/profile/reviews"}
                isLoading={isLoadingReviews}
                isOwner={isOwner}
                isPublic={privacy.showReviewsPublic}
                isSavingPrivacy={isSavingPrivacy}
                onPrivacyChange={
                  onPrivacyChange
                    ? (value) => onPrivacyChange("showReviewsPublic", value)
                    : undefined
                }
              />
              <ActivityCollectionCard
                title="My Favorite"
                count={favoriteCount}
                covers={favoriteCovers}
                href={favoritesAllHref ?? "/profile/albums"}
                isLoading={isLoadingFavorites}
                isOwner={isOwner}
                isPublic={privacy.showFavoritesPublic}
                isSavingPrivacy={isSavingPrivacy}
                onPrivacyChange={
                  onPrivacyChange
                    ? (value) => onPrivacyChange("showFavoritesPublic", value)
                    : undefined
                }
              />
            </div>

            {/* 활동 통계 버튼 — 가로 3열 */}
            <div className="mt-8 flex w-full flex-row items-stretch justify-center gap-2 px-4 pb-8 sm:gap-[13px] sm:px-[52px] lg:absolute lg:bottom-[24px] lg:left-1/2 lg:mt-0 lg:w-[986px] lg:max-w-[calc(100%-104px)] lg:-translate-x-1/2 lg:gap-[13px] lg:px-0 lg:pb-0">
              <ActivityStatBox
                label="작성한 게시글"
                count={activityStats?.postCount ?? 0}
                href="/profile/posts"
              />
              <ActivityStatBox
                label="작성한 댓글"
                count={activityStats?.commentCount ?? 0}
                href="/profile/comments"
              />
              <ActivityStatBox
                label="추천한 글"
                count={activityStats?.likedPostCount ?? 0}
              />
            </div>
          </section>
        )}

        {!isOwner && (
          <section className={`${SECTION_CARD} py-10 ${SECTION_INSET}`}>
            <ProfileSectionHeader title="나의 활동" />
            <div className="flex flex-wrap items-start justify-center gap-[46px]">
              {reviewsHidden ? (
                <div className="flex h-[282px] w-[266px] items-center justify-center rounded-[15px] border border-[#D9D9D9] bg-white p-5">
                  <PrivateSectionMessage />
                </div>
              ) : (
                <ActivityCollectionCard
                  title="My Reviews"
                  count={reviewCount}
                  covers={reviewCovers}
                  href={reviewsAllHref}
                  isLoading={isLoadingReviews}
                  isOwner={false}
                  isPublic
                />
              )}
              {favoritesHidden ? (
                <div className="flex h-[282px] w-[266px] items-center justify-center rounded-[15px] border border-[#D9D9D9] bg-white p-5">
                  <PrivateSectionMessage />
                </div>
              ) : (
                <ActivityCollectionCard
                  title="My Favorite"
                  count={favoriteCount}
                  covers={favoriteCovers}
                  href={favoritesAllHref}
                  isLoading={isLoadingFavorites}
                  isOwner={false}
                  isPublic
                />
              )}
            </div>
          </section>
        )}

        {/* ========== 3. 나의 Masterpiece ========== */}
        {masterpiecesHidden && !isOwner ? (
          <section className={`${SECTION_CARD} py-10 ${SECTION_INSET}`}>
            <ProfileSectionHeader title="나의 Masterpiece" />
            <PrivateSectionMessage />
          </section>
        ) : isOwner && masterpiecesSection ? (
          <div>{masterpiecesSection}</div>
        ) : (
          <section className={`${SECTION_CARD} pb-10 pt-10 ${SECTION_INSET}`}>
            <ProfileSectionHeader title="나의 Masterpiece" />
            {isLoadingMasterpieces ? (
              <p className="py-16 text-center text-sm text-zinc-500">불러오는 중...</p>
            ) : (
              <MasterpiecesReadOnlyGrid albums={visibleMasterpieces} />
            )}
          </section>
        )}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 프로필 아바타 (균일 border 링)                                               */
/* -------------------------------------------------------------------------- */

function ProfileAvatarRing({
  size,
  profileImage,
  nickname,
  href,
}: {
  size: 100 | 180;
  profileImage: string | null;
  nickname: string;
  href: string;
}) {
  const px = size === 180 ? 176 : 98;
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-full border-2 border-[#43A7B2] bg-white shadow-[0px_2px_4px_rgba(0,0,0,0.25)] box-border"
      style={{ width: size, height: size }}
    >
      {profileImage ? (
        <Link href={href} className="block h-full w-full">
          <Image
            src={profileImage}
            alt={nickname}
            width={px}
            height={px}
            sizes={`${px}px`}
            className="h-full w-full object-cover"
          />
        </Link>
      ) : (
        <div
          className={`flex h-full w-full items-center justify-center font-bold text-zinc-300 ${
            size === 180 ? "text-sm" : "text-[10px]"
          }`}
        >
          No Image
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 편집 연필 아이콘                                                            */
/* -------------------------------------------------------------------------- */

function EditPencilIcon({ size = 22 }: { size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/icons/edit-pencil.png"
      alt=""
      width={size}
      height={size}
      className="block object-contain"
      style={{ width: size, height: size }}
      draggable={false}
    />
  );
}

interface ActivityCollectionCardProps {
  title: string;
  count: number;
  covers: string[];
  href?: string;
  isLoading: boolean;
  isOwner: boolean;
  isPublic: boolean;
  isSavingPrivacy?: boolean;
  onPrivacyChange?: (value: boolean) => void;
}

/* -------------------------------------------------------------------------- */
/* My Reviews / My Favorite 컬렉션 카드                                        */
/* -------------------------------------------------------------------------- */

function ActivityCollectionCard({
  title,
  count,
  covers,
  href,
  isLoading,
  isOwner,
  isPublic,
  isSavingPrivacy = false,
  onPrivacyChange,
}: ActivityCollectionCardProps) {
  const slots = [covers[0] ?? null, covers[1] ?? null, covers[2] ?? null];
  // Figma: back(top-right) → mid → front(bottom-left)
  const coverLayers = [
    { left: 73.88, top: 5, z: 1, url: slots[2] },
    { left: 51.88, top: 19, z: 2, url: slots[1] },
    { left: 30, top: 33, z: 3, url: slots[0] },
  ];

  const content = (
    <div className="relative h-[282px] w-[266px] shrink-0 grow-0">
      {/* Cover stack — Group 192 */}
      {coverLayers.map((layer, index) => (
        <div
          key={index}
          className="absolute overflow-hidden bg-zinc-200"
          style={{
            left: layer.left,
            top: layer.top,
            width: 166.68,
            height: 166.68,
            borderRadius: "14.125px 14.125px 0 0",
            zIndex: layer.z,
          }}
        >
          {layer.url ? (
            <Image
              src={layer.url}
              alt=""
              width={167}
              height={167}
              unoptimized
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-zinc-100 to-zinc-300" />
          )}
        </div>
      ))}

      {/* White panel — Union (tab + body) */}
      <div
        className="absolute z-10"
        style={{
          left: 5,
          top: 123,
          width: 261,
          height: 159,
          filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.25))",
        }}
      >
        <div
          className="absolute bg-white"
          style={{ left: 0, top: 38, width: 261, height: 121, borderRadius: 15 }}
        />
        <div
          className="absolute bg-white"
          style={{ left: 0, top: 0, width: 132, height: 63, borderRadius: 15 }}
        />
      </div>

      {/* Title + count */}
      <p
        className="absolute z-20 flex items-center text-[15px] font-normal leading-[145%] tracking-[-0.005em] text-black"
        style={{ left: 26, top: 215, width: 120, height: 22 }}
      >
        {title}
      </p>
      <p
        className="absolute z-20 flex items-center text-[22px] font-normal leading-[145%] tracking-[-0.005em] text-[#909090]"
        style={{ left: 26, top: 238, width: 120, height: 32 }}
      >
        {isLoading ? "..." : `${count} Saved`}
      </p>

      {/* Privacy toggle — Group 195 */}
      {isOwner && onPrivacyChange && (
        <div
          className="absolute z-20"
          style={{ left: 17, top: 131, width: 111, height: 35 }}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
          }}
        >
          <ProfilePrivacyToggle
            isPublic={isPublic}
            disabled={isSavingPrivacy}
            onChange={onPrivacyChange}
          />
        </div>
      )}
    </div>
  );

  if (!href) return content;

  return (
    <Link href={href} className="relative block h-[282px] w-[266px] shrink-0 grow-0">
      {content}
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/* 활동 통계 박스 (게시글 · 댓글 · 추천)                                       */
/* -------------------------------------------------------------------------- */

function ActivityStatBox({
  label,
  count,
  href,
}: {
  label: string;
  count: number;
  href?: string;
}) {
  const body = (
    <div className="box-border flex h-[52px] w-full flex-col items-center justify-center gap-0.5 rounded-[10px] border border-[#D9D9D9] bg-white px-1.5 text-center text-[11px] leading-[13px] text-black transition hover:border-[#43A7B2] sm:h-[60px] sm:flex-row sm:justify-between sm:gap-0 sm:px-4 sm:text-left sm:text-[13px] sm:leading-[16px] lg:w-[320px] lg:flex-none lg:px-[27px] lg:text-[14px] lg:leading-[17px]">
      <span className="max-w-full truncate">{label}</span>
      <span className="shrink-0 sm:text-right">{count}개</span>
    </div>
  );

  if (!href) {
    return <div className="min-w-0 flex-1 lg:w-[320px] lg:flex-none">{body}</div>;
  }
  return (
    <Link href={href} className="block min-w-0 flex-1 lg:w-[320px] lg:flex-none">
      {body}
    </Link>
  );
}
