/** 프로필 공개설정 Y/N ↔ boolean 헬퍼 */

import type { ProfilePrivacySettings } from "@/src/components/profile/profile-types";

export const PRIVACY_KEYS = [
  "showReviewsPublic",
  "showFavoritesPublic",
  "showMasterpiecesPublic",
  "showRatingPublic",
  "showPlaylistsPublic",
] as const;

export type PrivacyKey = (typeof PRIVACY_KEYS)[number];

export type PrivacyYn = "Y" | "N";

export type PrivacyYnFields = Record<PrivacyKey, PrivacyYn>;

export function ynToBool(flag: PrivacyYn | undefined): boolean {
  return flag !== "N";
}

export function boolToYn(value: boolean): PrivacyYn {
  return value ? "Y" : "N";
}

export function boolToYnOptional(
  value: boolean | undefined
): PrivacyYn | undefined {
  if (value === undefined) return undefined;
  return boolToYn(value);
}

export function toPrivacySettings(
  source: Partial<PrivacyYnFields>
): ProfilePrivacySettings {
  return {
    showReviewsPublic: ynToBool(source.showReviewsPublic),
    showFavoritesPublic: ynToBool(source.showFavoritesPublic),
    showMasterpiecesPublic: ynToBool(source.showMasterpiecesPublic),
    showRatingPublic: ynToBool(source.showRatingPublic),
    showPlaylistsPublic: ynToBool(source.showPlaylistsPublic),
  };
}

export function privacyUpdatesFromBody(
  body: Partial<Record<PrivacyKey, boolean>>
): Partial<PrivacyYnFields> {
  const updates: Partial<PrivacyYnFields> = {};
  for (const key of PRIVACY_KEYS) {
    const yn = boolToYnOptional(body[key]);
    if (yn !== undefined) {
      updates[key] = yn;
    }
  }
  return updates;
}
