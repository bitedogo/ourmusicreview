import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth/config";
import { uploadAudioFile } from "@/src/lib/supabase";
import { apiError, apiOk } from "@/src/lib/http/response";
import { MAX_AUDIO_SIZE_BYTES, isAllowedAudioFile } from "@/src/lib/audio";

export const config = {
  api: {
    bodyParser: false, 
  },
};

export const maxDuration = 60;


export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiError("로그인이 필요합니다.", { status: 401 });
    }

    const formData = await request.formData();
    const audioFile = formData.get("audioFile") as File | null;

    if (!audioFile || audioFile.size === 0) {
      return apiError("업로드할 음원 파일을 선택해주세요.", { status: 400 });
    }

    if (audioFile.size > MAX_AUDIO_SIZE_BYTES) {
      return apiError("파일 용량은 20MB 이하여야 합니다.", { status: 400 });
    }

    if (!isAllowedAudioFile(audioFile)) {
      return apiError("지원 형식은 MP3, WAV 입니다.", { status: 400 });
    }

    const url = await uploadAudioFile(audioFile, session.user.id);
    return apiOk({ url });
  } catch (error) {
    return apiError(
      error instanceof Error
        ? error.message
        : "음원 업로드 중 오류가 발생했습니다.",
      { status: 500 }
    );
  }
}
