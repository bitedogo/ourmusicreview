/** 나의 Masterpiece 섹션 헤더 (제목 · i · 편집 · 공개 토글) */

import { MasterpieceInfoTip } from "../ProfileInfoTips";
import { ProfilePrivacyToggle } from "../ProfilePrivacyToggle";
import {
  MASTERPIECE_EDIT_BUTTON_CLASS,
  PROFILE_SECTION_TITLE,
  PROFILE_SECTION_TITLE_INSET,
  PROFILE_SECTION_TITLE_INSET_END,
} from "../profile-section-styles";

interface MasterpieceSectionHeaderProps {
  isEditing: boolean;
  onToggleEditing: () => void;
  isPublic?: boolean;
  isSavingPrivacy?: boolean;
  onPrivacyChange?: (value: boolean) => void;
}

export function MasterpieceSectionHeader({
  isEditing,
  onToggleEditing,
  isPublic = true,
  isSavingPrivacy = false,
  onPrivacyChange,
}: MasterpieceSectionHeaderProps) {
  return (
    <div className="mb-6 flex flex-row items-center justify-between gap-3">
      <div
        className={`flex shrink-0 items-center gap-[10px] whitespace-nowrap ${PROFILE_SECTION_TITLE_INSET}`}
      >
        <h2 className={PROFILE_SECTION_TITLE}>나의 Masterpiece</h2>
        <MasterpieceInfoTip />
      </div>
      <div
        className={`flex shrink-0 items-center justify-end gap-3 ${PROFILE_SECTION_TITLE_INSET_END}`}
      >        <button
          type="button"
          onClick={onToggleEditing}
          className={`${MASTERPIECE_EDIT_BUTTON_CLASS} ${
            isEditing
              ? "bg-[#43A7B2] text-white"
              : "bg-white text-[#43A7B2] hover:bg-[#FAFAFA]"
          }`}
        >
          {isEditing ? "완료" : "편집"}
        </button>
        {onPrivacyChange && (
          <ProfilePrivacyToggle
            size="responsive"
            isPublic={isPublic}
            disabled={isSavingPrivacy}
            onChange={onPrivacyChange}
          />
        )}
      </div>
    </div>
  );
}
