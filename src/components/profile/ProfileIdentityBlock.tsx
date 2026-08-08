/** 프로필 헤더 신원 블록 (아바타·닉네임·메타·수정) */

import Link from "next/link";
import { EditPencilIcon } from "./EditPencilIcon";
import { ProfileAvatarRing } from "./ProfileAvatarRing";
import { GENDER_LABEL } from "./profile-types";

interface ProfileIdentityBlockProps {
  variant: "desktop" | "mobile";
  isOwner: boolean;
  profilePreviewHref: string;
  profileImage: string | null;
  nickname: string;
  name: string | null;
  gender: "MALE" | "FEMALE" | "NONE" | null;
  createdAtText: string;
}

export function ProfileIdentityBlock({
  variant,
  isOwner,
  profilePreviewHref,
  profileImage,
  nickname,
  name,
  gender,
  createdAtText,
}: ProfileIdentityBlockProps) {
  const isDesktop = variant === "desktop";
  const genderLabel = gender ? GENDER_LABEL[gender] ?? gender : "-";

  return (
    <div
      className={
        isDesktop
          ? "relative flex h-full flex-col items-center justify-center px-10"
          : "flex w-full flex-col items-center justify-center gap-5"
      }
    >
      <ProfileAvatarRing
        size={isDesktop ? 180 : 100}
        profileImage={profileImage}
        nickname={nickname}
        href={profilePreviewHref}
      />

      <p
        className={`text-[24px] font-normal leading-[29px] text-[var(--color-text-primary)] ${
          isDesktop ? "mt-4" : ""
        }`}
      >
        {nickname}
      </p>

      {isDesktop ? (
        <dl className="mt-8 w-full max-w-[280px] space-y-[26px] text-[14px] leading-[17px]">
          {isOwner && (
            <div className="grid grid-cols-[55px_1fr] gap-x-[20px]">
              <dt className="text-[#7F7F7F]">이름</dt>
              <dd className="truncate text-[var(--color-text-primary)]">{name ?? "-"}</dd>
            </div>
          )}
          <div className="grid grid-cols-[55px_1fr] gap-x-[20px]">
            <dt className="text-[#7F7F7F]">성별</dt>
            <dd className="text-[var(--color-text-primary)]">{genderLabel}</dd>
          </div>
          <div className="grid grid-cols-[55px_1fr] items-center gap-x-[20px]">
            <dt className="text-[#7F7F7F]">가입일</dt>
            <dd className="truncate text-[var(--color-text-primary)]">{createdAtText}</dd>
          </div>
        </dl>
      ) : (
        <dl className="flex w-[165px] flex-col gap-[15px] pt-2.5 text-[11px] leading-[13px]">
          {isOwner && (
            <div className="flex gap-0">
              <dt className="w-[55px] shrink-0 text-[#7F7F7F]">이름</dt>
              <dd className="min-w-0 truncate text-[var(--color-text-primary)]">{name ?? "-"}</dd>
            </div>
          )}
          <div className="flex">
            <dt className="w-[55px] shrink-0 text-[#7F7F7F]">성별</dt>
            <dd className="text-[var(--color-text-primary)]">{genderLabel}</dd>
          </div>
          <div className="flex">
            <dt className="w-[55px] shrink-0 text-[#7F7F7F]">가입일</dt>
            <dd className="min-w-0 truncate text-[var(--color-text-primary)]">{createdAtText}</dd>
          </div>
        </dl>
      )}

      {isOwner &&
        (isDesktop ? (
          <Link
            href="/profile/edit"
            aria-label="내 정보 수정"
            className="absolute bottom-[62px] right-10 inline-flex h-[24px] w-[24px] items-center justify-center overflow-visible"
          >
            <EditPencilIcon />
          </Link>
        ) : (
          <div className="flex h-5 w-full items-center justify-end px-[27px]">
            <Link
              href="/profile/edit"
              aria-label="내 정보 수정"
              className="inline-flex h-5 w-5 items-center justify-center"
            >
              <EditPencilIcon size={20} />
            </Link>
          </div>
        ))}
    </div>
  );
}
