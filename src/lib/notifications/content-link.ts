/** 알림이 가리키는 콘텐츠 경로 */

import {
  communityDetail,
  playlistDetail,
  reviewDetail,
} from "@/src/lib/navigation/routes";

export function contentTargetLink(target: {
  postId?: string | null;
  reviewId?: string | null;
  playlistId?: string | null;
}): string | null {
  if (target.postId) return communityDetail(target.postId);
  if (target.reviewId) return reviewDetail(target.reviewId);
  if (target.playlistId) return playlistDetail(target.playlistId);
  return null;
}
