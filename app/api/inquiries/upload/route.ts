/** POST 문의 첨부파일 업로드 */

import { requireSessionApi } from "@/src/lib/auth/session";
import { handleRouteError } from "@/src/lib/http/handle-route-error";
import { apiOk } from "@/src/lib/http/response";
import { uploadInquiryAttachment } from "@/src/lib/storage/inquiry";

export async function POST(request: Request) {
  try {
    const { response } = await requireSessionApi();
    if (response) return response;

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return handleRouteError(
        new Error("업로드할 파일을 선택해주세요."),
        "파일 업로드 중 오류가 발생했습니다."
      );
    }
    const attachment = await uploadInquiryAttachment(file);
    return apiOk({ attachment });
  } catch (error) {
    return handleRouteError(error, "파일 업로드 중 오류가 발생했습니다.");
  }
}
