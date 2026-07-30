/** 프로필 섹션 제목 + (선택) 안내 아이콘 + 구분선 */

import { ReactNode } from "react";
import {
  PROFILE_SECTION_DIVIDER,
  PROFILE_SECTION_TITLE,
  PROFILE_SECTION_TITLE_INSET,
} from "./profile-section-styles";

interface ProfileSectionHeaderProps {
  title: string;
  tip?: ReactNode;
}

export function ProfileSectionHeader({
  title,
  tip,
}: ProfileSectionHeaderProps) {
  return (
    <>
      <div
        className={`mb-6 flex items-center gap-[10px] ${PROFILE_SECTION_TITLE_INSET}`}
      >
        <h2 className={PROFILE_SECTION_TITLE}>{title}</h2>
        {tip}
      </div>
      <div className={PROFILE_SECTION_DIVIDER} aria-hidden />
    </>
  );
}
