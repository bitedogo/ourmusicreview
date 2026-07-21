/** 활동 섹션 비공개 placeholder (폴더 카드와 동일 크기) */

import { PrivateSectionMessage } from "../PrivateSectionMessage";
import { ACTIVITY_PRIVATE_PLACEHOLDER_CLASS } from "./activity-folder-styles";

export function ActivityPrivatePlaceholder() {
  return (
    <div className={ACTIVITY_PRIVATE_PLACEHOLDER_CLASS}>
      <PrivateSectionMessage />
    </div>
  );
}
