/** POST 플레이리스트 대표사진 업로드(생성 전용, URL만 반환) */

import { requireSessionApi } from "@/src/lib/auth/session";
import { apiError, apiOk } from "@/src/lib/http/response";
import { uploadPlaylistCoverImage } from "@/src/lib/supabase";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
];

export async function POST(request: Request) {
  try {
    const { response } = await requireSessionApi();
    if (response) return response;

    const formData = await request.formData();
    const coverImage = formData.get("coverImage") as File | null;

    if (!coverImage || coverImage.size === 0) {
      return apiError("업로드할 이미지를 선택해주세요.", { status: 400 });
    }
    if (coverImage.size > 5 * 1024 * 1024) {
      return apiError("파일 용량은 5MB 이하여야 합니다.", { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(coverImage.type)) {
      return apiError("지원하는 이미지 형식: JPEG, PNG, GIF, WebP", {
        status: 400,
      });
    }

    const coverImageUrl = await uploadPlaylistCoverImage(coverImage);
    return apiOk({ coverImageUrl });
  } catch (error) {
    return apiError(
      error instanceof Error
        ? error.message
        : "대표사진 업로드 중 오류가 발생했습니다.",
      { status: 500 }
    );
  }
}
