/** 리뷰 반려 사유 상수 */

export const REVIEW_REJECTION_REASONS = [
  "ORU 커뮤니티 가이드라인 위반 - 비방",
  "ORU 커뮤니티 가이드라인 위반 - 도배",
  "ORU 커뮤니티 가이드라인 위반 - 저작권 위반",
  "ORU 커뮤니티 가이드라인 위반",
  "앨범 및 음악에 대한 비평과 관련 없는 단순 팬심 고백, 친목 등 서비스 성격에 맞지 않는 게시물",
] as const;

export type ReviewRejectionReason = (typeof REVIEW_REJECTION_REASONS)[number];

export function isReviewRejectionReason(value: unknown): value is ReviewRejectionReason {
  return (
    typeof value === "string" &&
    REVIEW_REJECTION_REASONS.includes(value as ReviewRejectionReason)
  );
}
