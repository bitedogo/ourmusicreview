/** POST 문의 첨부파일 업로드 */

import { requireSessionApi } from "@/src/lib/auth/session";
import { handleApi, handleRouteError } from "@/src/lib/http/handle-route-error";
import { apiOk } from "@/src/lib/http/response";
import { uploadInquiryAttachment } from "@/src/lib/storage/inquiry";
import { deletePrivateObject } from "@/src/lib/storage/r2";
import { ServiceError } from "@/src/lib/http/service-error";

export async function POST(request: Request) {
  try {
    const { session, response } = await requireSessionApi();
    if (response) return response;

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return handleRouteError(
        new Error("업로드할 파일을 선택해주세요."),
        "파일 업로드 중 오류가 발생했습니다."
      );
    }
    const attachment = await uploadInquiryAttachment(file, session.user.id);
    return apiOk({ attachment });
  } catch (error) {
    return handleRouteError(error, "파일 업로드 중 오류가 발생했습니다.");
  }
}

export async function DELETE(request: Request) {
  return handleApi("파일 삭제 중 오류가 발생했습니다.", async () => {
    const { session, response } = await requireSessionApi();
    if (response) return response;
    const key = new URL(request.url).searchParams.get("key")?.trim();
    if (!key || !key.startsWith(`inquiries/${session.user.id}/`)) {
      throw new ServiceError("삭제할 수 없는 첨부파일입니다.", 403);
    }
    await deletePrivateObject(key);
    return apiOk({});
  });
}
