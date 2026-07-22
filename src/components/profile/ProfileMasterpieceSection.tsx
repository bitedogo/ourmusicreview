/** 나의 Masterpiece 섹션 (읽기 전용 / 비공개) */

import { ReactNode } from "react";
import { PrivateSectionMessage } from "./PrivateSectionMessage";
import { ProfileSectionHeader } from "./ProfileSectionHeader";
import { MasterpiecesReadOnlyGrid } from "./masterpiece/MasterpiecesReadOnlyGrid";
import type { ProfileMasterpieceItem } from "./profile-types";
import {
  PROFILE_SECTION_CARD,
  PROFILE_SECTION_INSET,
  PROFILE_CLUSTER_BAND_CLASS,
} from "./profile-section-styles";

interface ProfileMasterpieceSectionProps {
  isOwner: boolean;
  masterpiecesHidden?: boolean;
  masterpiecesSection?: ReactNode;
  visibleMasterpieces: ProfileMasterpieceItem[];
  isLoadingMasterpieces: boolean;
}

export function ProfileMasterpieceSection({
  isOwner,
  masterpiecesHidden = false,
  masterpiecesSection,
  visibleMasterpieces,
  isLoadingMasterpieces,
}: ProfileMasterpieceSectionProps) {
  if (masterpiecesHidden && !isOwner) {
    return (
      <section className={`${PROFILE_SECTION_CARD} py-10 ${PROFILE_SECTION_INSET}`}>
        <ProfileSectionHeader title="나의 Masterpiece" />
        <PrivateSectionMessage />
      </section>
    );
  }

  if (isOwner && masterpiecesSection) {
    return <div>{masterpiecesSection}</div>;
  }

  return (
    <section className={`${PROFILE_SECTION_CARD} pb-10 pt-10 ${PROFILE_SECTION_INSET}`}>
      <ProfileSectionHeader title="나의 Masterpiece" />
      {isLoadingMasterpieces ? (
        <p className="py-16 text-center text-sm text-zinc-500">불러오는 중...</p>
      ) : (
        <div className={PROFILE_CLUSTER_BAND_CLASS}>
          <MasterpiecesReadOnlyGrid albums={visibleMasterpieces} />
        </div>
      )}
    </section>
  );
}
