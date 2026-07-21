/** 프로필 섹션 제목 + (선택) 안내 아이콘 + 구분선 */

import { ReactNode } from "react";
import {
  PROFILE_SECTION_DIVIDER,
  PROFILE_SECTION_TITLE,
} from "./profile-section-styles";

interface ProfileSectionHeaderProps {
  title: string;
  tip?: ReactNode;
  /** 구분선 표시 (기본 true) */
  showDivider?: boolean;
  titleClassName?: string;
}

export function ProfileSectionHeader({
  title,
  tip,
  showDivider = true,
  titleClassName = "mb-6",
}: ProfileSectionHeaderProps) {
  return (
    <>
      <div className={`flex items-center gap-[10px] ${titleClassName}`}>
        <h2 className={PROFILE_SECTION_TITLE}>{title}</h2>
        {tip}
      </div>
      {showDivider && <div className={PROFILE_SECTION_DIVIDER} aria-hidden />}
    </>
  );
}
