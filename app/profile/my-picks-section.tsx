"use client";

/** 나의 Masterpiece — 헤더 + 그리드 조합 */

import { MasterpieceAlbumsGrid } from "@/src/components/profile/masterpiece/MasterpieceAlbumsGrid";
import { MasterpieceSectionHeader } from "@/src/components/profile/masterpiece/MasterpieceSectionHeader";
import { useUserSlideAlbums } from "@/src/components/profile/masterpiece/useUserSlideAlbums";
import {
  PROFILE_EMBEDDED_SECTION_CLASS,
  PROFILE_SECTION_DIVIDER,
} from "@/src/components/profile/profile-section-styles";

interface MyPicksSectionProps {
  embedded?: boolean;
  isPublic?: boolean;
  isSavingPrivacy?: boolean;
  onPrivacyChange?: (value: boolean) => void;
}

export function MyPicksSection({
  embedded = false,
  isPublic = true,
  isSavingPrivacy = false,
  onPrivacyChange,
}: MyPicksSectionProps) {
  const slide = useUserSlideAlbums();

  const grid = (
    <MasterpieceAlbumsGrid
      albums={slide.albums}
      isLoading={slide.isLoading}
      error={slide.error}
      isEditing={slide.isEditing}
      canAdd={slide.canAdd}
      isEmpty={slide.isEmpty}
      processingIds={slide.processingIds}
      draggingId={slide.draggingId}
      isSavingOrder={slide.isSavingOrder}
      modalOpen={slide.modalOpen}
      addSubmitting={slide.addSubmitting}
      addError={slide.addError}
      onOpenAdd={slide.openAddModal}
      onCloseModal={() => slide.setModalOpen(false)}
      onAlbumSelect={slide.handleAlbumSelect}
      onDragStart={slide.handleDragStart}
      onDrop={slide.handleDrop}
      onDragEnd={slide.handleDragEnd}
      onRemove={slide.removeAlbum}
    />
  );

  if (!embedded) {
    return <section className="flex shrink-0 flex-col">{grid}</section>;
  }

  return (
    <section className={PROFILE_EMBEDDED_SECTION_CLASS}>
      <MasterpieceSectionHeader
        isEditing={slide.isEditing}
        onToggleEditing={() => slide.setIsEditing((v) => !v)}
        isPublic={isPublic}
        isSavingPrivacy={isSavingPrivacy}
        onPrivacyChange={onPrivacyChange}
      />
      <div className={PROFILE_SECTION_DIVIDER} aria-hidden />
      {grid}
    </section>
  );
}
