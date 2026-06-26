"use client";

import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";
import { getUserProfilePath } from "@/components/user-profile-view";
import {
  ProfilePrivacySettings,
  ProfileReviewItem,
  ProfileFavoriteItem,
  ProfileMasterpieceItem,
  GENDER_LABEL,
} from "./profile/profile-types";
import { PrivacyToggle } from "./profile/PrivacyToggle";
import { PrivateSectionMessage } from "./profile/PrivateSectionMessage";
import { ProfileRatingGauge } from "./profile/ProfileRatingGauge";
import { ProfileReviewRow } from "./profile/ProfileReviewRow";

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
    role,
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
  } = props;

  const isOwner = mode === "owner";
  const profilePreviewHref = getUserProfilePath(userId);
  const visibleReviews = isOwner || !reviewsHidden ? reviews : [];
  const visibleFavorites = isOwner || !favoritesHidden ? favoriteAlbums : [];
  const visibleMasterpieces = isOwner || !masterpiecesHidden ? masterpieces : [];
  const reviewCount = totalReviewCount ?? reviews.length;
  const showReviewGauge = isOwner || !ratingHidden;
  const gaugeReviews = isOwner ? reviews : visibleReviews;

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-5xl px-3 py-6 sm:px-6 sm:py-8 md:px-10">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900 md:text-2xl">
            {pageTitle}
          </h1>
          {headerAction}
        </div>

        <div className="mb-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="flex flex-col md:flex-row">
            <div className="flex flex-1 flex-col items-center gap-4 border-b border-zinc-100 p-6 md:min-w-0 md:border-b-0 md:border-r md:border-zinc-100">
              <ProfileAvatar
                isOwner={isOwner}
                profilePreviewHref={profilePreviewHref}
                profileImage={profileImage}
                nickname={nickname}
              />
              
              <div className="text-center">
                <p className="text-base font-bold text-zinc-900 md:text-lg">{nickname}</p>
                {isOwner && <p className="mt-0.5 truncate text-xs text-zinc-500">{userId}</p>}
              </div>

              <div className="grid w-full grid-cols-2 gap-3">
                <ProfileStatCard
                  label="리뷰"
                  value={reviewsHidden && !isOwner ? "-" : reviewCount}
                />
                <ProfileStatCard
                  label="좋아요"
                  value={favoritesHidden && !isOwner ? "-" : visibleFavorites.length}
                />
              </div>

              {isOwner && (
                <Link
                  href="/profile/edit"
                  className="w-full rounded-lg bg-[var(--color-brand-primary)] px-4 py-2.5 text-center text-sm font-medium text-white transition hover:bg-[var(--color-brand-primary-hover)]"
                >
                  내 정보 수정
                </Link>
              )}
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-6 border-b border-zinc-100 p-6 md:border-b-0 md:border-r md:border-zinc-100">
              <div className="grid grid-cols-2 gap-x-10 gap-y-6 sm:grid-cols-4">
                {isOwner && <ProfileInfoItem label="이름" value={name ?? "-"} />}
                <ProfileInfoItem label="성별" value={gender ? GENDER_LABEL[gender] ?? gender : "-"} />
                <ProfileInfoItem label="닉네임" value={nickname} />
                {isOwner && role && <ProfileInfoItem label="권한" value={role} className="col-span-2 sm:col-span-4" />}
                <ProfileInfoItem label="가입일" value={createdAtText} className="col-span-2 sm:col-span-4" valueClassName="text-zinc-600" />
              </div>

              {isOwner && <ProfileActivityLinks />}
            </div>

            <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-3 border-zinc-100 py-6 md:border-l md:border-zinc-100 md:py-0">
              {isOwner && onPrivacyChange && (
                <div className="flex items-center gap-2">
                  <PrivacyToggle
                    isPublic={privacy.showRatingPublic}
                    disabled={isSavingPrivacy}
                    onChange={(value) => onPrivacyChange("showRatingPublic", value)}
                  />
                </div>
              )}
              {showReviewGauge ? (
                <ProfileRatingGauge
                  reviews={gaugeReviews}
                  nickname={nickname}
                  averageRating={!isOwner ? averageRating : undefined}
                />
              ) : (
                <PrivateSectionMessage />
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <SectionHeader
                title={isOwner ? "나의 리뷰" : "작성 리뷰"}
                isOwner={isOwner}
                isPublic={privacy.showReviewsPublic}
                isSaving={isSavingPrivacy}
                onPrivacyChange={(val: boolean) => onPrivacyChange?.("showReviewsPublic", val)}
                allHref={reviewsAllHref}
                hideAll={!isOwner && reviewsHidden}
              />

              {reviewsHidden && !isOwner ? (
                <PrivateSectionMessage />
              ) : isLoadingReviews ? (
                <p className="text-xs text-zinc-500">불러오는 중...</p>
              ) : visibleReviews.length === 0 ? (
                <p className="text-xs text-zinc-500">작성한 리뷰가 없습니다.</p>
              ) : (
                <div className="space-y-2">
                  {visibleReviews.slice(0, 5).map((review) => (
                    <ProfileReviewRow key={review.id} review={review} />
                  ))}
                </div>
              )}
            </section>

            <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <SectionHeader
                title="좋아하는 앨범"
                isOwner={isOwner}
                isPublic={privacy.showFavoritesPublic}
                isSaving={isSavingPrivacy}
                onPrivacyChange={(val: boolean) => onPrivacyChange?.("showFavoritesPublic", val)}
                allHref={favoritesAllHref}
                hideAll={!isOwner && favoritesHidden}
              />

              {favoritesHidden && !isOwner ? (
                <PrivateSectionMessage />
              ) : isLoadingFavorites ? (
                <p className="text-xs text-zinc-500">불러오는 중...</p>
              ) : visibleFavorites.length === 0 ? (
                <p className="text-xs text-zinc-500">좋아요한 앨범이 없습니다.</p>
              ) : (
                <div className="grid grid-cols-3 grid-rows-2 gap-3">
                  {visibleFavorites.slice(0, 6).map((fav) => (
                    <FavoriteAlbumCard key={fav.id} fav={fav} />
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold tracking-tight text-zinc-900 md:text-base">나만의 명반</h2>
              {isOwner && onPrivacyChange && (
                <PrivacyToggle
                  isPublic={privacy.showMasterpiecesPublic}
                  disabled={isSavingPrivacy}
                  onChange={(value) => onPrivacyChange("showMasterpiecesPublic", value)}
                />
              )}
            </div>

            {masterpiecesHidden && !isOwner ? (
              <PrivateSectionMessage />
            ) : isOwner && masterpiecesSection ? (
              masterpiecesSection
            ) : isLoadingMasterpieces ? (
              <p className="text-sm text-zinc-500">불러오는 중...</p>
            ) : (
              <MasterpiecesReadOnly albums={visibleMasterpieces} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface ProfileAvatarProps {
  isOwner: boolean;
  profilePreviewHref: string;
  profileImage: string | null;
  nickname: string;
}

function ProfileAvatar({ isOwner, profilePreviewHref, profileImage, nickname }: ProfileAvatarProps) {
  const node = (
    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full border-2 border-zinc-100 bg-zinc-100 shadow-sm md:h-28 md:w-28">
      {profileImage ? (
        <Image src={profileImage} alt={nickname} width={112} height={112} unoptimized className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-xs font-bold uppercase text-zinc-400">No Image</div>
      )}
    </div>
  );

  return isOwner ? (
    <Link href={profilePreviewHref} className="shrink-0">
      {node}
    </Link>
  ) : node;
}

function ProfileStatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-zinc-50 px-3 py-2 text-center">
      <p className="text-lg font-bold text-zinc-900">{value}</p>
      <p className="text-[10px] font-medium text-zinc-500">{label}</p>
    </div>
  );
}

interface ProfileInfoItemProps {
  label: string;
  value: string;
  className?: string;
  valueClassName?: string;
}

function ProfileInfoItem({ label, value, className = "", valueClassName = "text-zinc-900" }: ProfileInfoItemProps) {
  return (
    <div className={className}>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">{label}</p>
      <p className={`mt-1.5 truncate text-sm font-medium ${valueClassName}`}>{value}</p>
    </div>
  );
}

function ProfileActivityLinks() {
  return (
    <div className="border-t border-zinc-100 pt-5">
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">나의 활동</p>
      <div className="flex flex-wrap gap-2">
        <ActivityLink href="/profile/posts">내가 쓴 게시글</ActivityLink>
        <ActivityLink href="/profile/comments">내가 쓴 댓글</ActivityLink>
      </div>
    </div>
  );
}

function ActivityLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="whitespace-nowrap rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-100 hover:text-[var(--color-brand-primary)]"
    >
      {children}
    </Link>
  );
}

interface SectionHeaderProps {
  title: string;
  isOwner: boolean;
  isPublic: boolean;
  isSaving: boolean;
  onPrivacyChange: (val: boolean) => void;
  allHref?: string;
  hideAll: boolean;
}

function SectionHeader({ title, isOwner, isPublic, isSaving, onPrivacyChange, allHref, hideAll }: SectionHeaderProps) {
  return (
    <div className="mb-4 flex items-center justify-between gap-2">
      <h2 className="text-sm font-semibold tracking-tight text-zinc-900">{title}</h2>
      <div className="flex items-center gap-2">
        {isOwner && onPrivacyChange && (
          <PrivacyToggle isPublic={isPublic} disabled={isSaving} onChange={onPrivacyChange} />
        )}
        {allHref && !hideAll && (
          <Link href={allHref} className="text-xs font-medium text-zinc-500 hover:text-[var(--color-brand-primary)]">
            전체보기
          </Link>
        )}
      </div>
    </div>
  );
}

function FavoriteAlbumCard({ fav }: { fav: ProfileFavoriteItem }) {
  return (
    <Link
      href={`/review/album/${encodeURIComponent(fav.albumId || (fav.album?.albumId ?? ""))}`}
      className="flex min-w-0 flex-col gap-2 rounded-xl border border-zinc-100 bg-zinc-50 p-2 transition hover:border-zinc-200 hover:bg-zinc-100"
    >
      {fav.album?.imageUrl ? (
        <Image src={fav.album.imageUrl} className="aspect-square w-full rounded-md object-cover" alt={fav.album?.title ?? "앨범 커버"} width={100} height={100} unoptimized />
      ) : (
        <div className="aspect-square w-full rounded-md bg-zinc-100" />
      )}
      <div className="min-h-[2rem] min-w-0 space-y-0.5 text-center">
        <p className="line-clamp-2 w-full text-[10px] font-semibold leading-tight text-zinc-900">{fav.album?.title ?? ""}</p>
        {fav.album?.artist && <p className="w-full truncate text-[9px] text-zinc-500">{fav.album.artist}</p>}
      </div>
    </Link>
  );
}

function MasterpiecesReadOnly({ albums }: { albums: ProfileMasterpieceItem[] }) {
  if (albums.length === 0) return <p className="text-xs text-zinc-500">등록된 앨범이 없습니다.</p>;

  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
      {[albums.slice(0, 15), albums.slice(15, 30)].map((column, colIdx) => (
        <div key={colIdx} className="flex flex-col space-y-1.5">
          {column.map((album) => (
            <Link
              key={album.id}
              href={`/review/album/${encodeURIComponent(album.collectionId)}`}
              className="flex items-center gap-2 rounded-lg border border-zinc-100 bg-white p-2 transition hover:bg-zinc-50"
            >
              {album.imageUrl ? (
                <Image src={album.imageUrl} alt={album.title} width={32} height={32} unoptimized className="h-8 w-8 shrink-0 rounded object-cover" />
              ) : (
                <div className="h-8 w-8 shrink-0 rounded bg-zinc-200" />
              )}
              <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-zinc-900">{album.title} · {album.artist}</span>
            </Link>
          ))}
        </div>
      ))}
    </div>
  );
}
