/** 리뷰 작성 전 중복·로그인 확인 */

import { ApiClientError, getApiErrorMessage } from "@/src/lib/http/client";
import { checkReviewExists } from "@/src/lib/reviews/client-api";

export type ReviewWriteGuardResult =
  | { status: "ready" }
  | { status: "duplicate" }
  | { status: "unauthenticated" }
  | { status: "error"; message: string };

export async function guardReviewWrite(
  albumId: string
): Promise<ReviewWriteGuardResult> {
  try {
    const check = await checkReviewExists(albumId);
    if (check.data.exists) {
      return { status: "duplicate" };
    }
    return { status: "ready" };
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 401) {
      return { status: "unauthenticated" };
    }
    return {
      status: "error",
      message: getApiErrorMessage(
        error,
        "리뷰 작성 여부를 확인하지 못했습니다."
      ),
    };
  }
}
