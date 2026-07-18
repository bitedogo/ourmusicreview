/** POST 오디오 파일 업로드 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth/config";
import { uploadAudioFile } from "@/src/lib/supabase";
import { apiError, apiOk } from "@/src/lib/http/response";

const SERVER_LIMIT_MB = 4;
const SERVER_LIMIT_BYTES = SERVER_LIMIT_MB * 1024 * 1024;

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiError("로그인이 필요합니다.", { status: 401 });
    }

    const contentLength = parseInt(request.headers.get("content-length") || "0");
    if (contentLength > SERVER_LIMIT_BYTES) {
      return apiError(
        `파일 용량이 너무 큽니다. 서버 제한으로 인해 ${SERVER_LIMIT_MB}MB 이하의 파일만 업로드 가능합니다.`,
        { status: 413 }
      );
    }

    const formData = await request.formData();
    const audioFile = formData.get("audioFile") as File | null;

    if (!audioFile || audioFile.size === 0) {
      return apiError("업로드할 음원 파일을 선택해주세요.", { status: 400 });
    }

    if (audioFile.size > SERVER_LIMIT_BYTES) {
      return apiError(
        `현재 버전에서는 ${SERVER_LIMIT_MB}MB 이하의 음원만 업로드할 수 있습니다.`,
        { status: 400 }
      );
    }

    const fileExt = audioFile.name.split('.').pop()?.toLowerCase();
    if (fileExt !== 'mp3' && fileExt !== 'wav') {
      return apiError("지원 형식은 MP3, WAV 입니다.", { status: 400 });
    }

    const url = await uploadAudioFile(audioFile, session.user.id);
    return apiOk({ url });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "";
    if (errorMessage.includes("body size") || errorMessage.includes("too large")) {
      return apiError("4MB 이하의 파일만 업로드 가능합니다.", { status: 413 });
    }

    return apiError(
      "음원 업로드 중 오류가 발생했습니다. (4MB 이하 파일 권장)",
      { status: 500 }
    );
  }
}