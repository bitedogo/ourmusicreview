/** DELETE 회원 탈퇴 */

import { requireSessionApi } from "@/src/lib/auth/session";
import { initializeDatabase } from "@/src/lib/db";
import { deleteUserAccount } from "@/src/lib/users/user-deletion";
import { apiError, apiOk } from "@/src/lib/http/response";

export async function DELETE() {
  try {
    const { session, response } = await requireSessionApi();
    if (response) return response;

    const dataSource = await initializeDatabase();
    const deleted = await deleteUserAccount(dataSource, session.user.id);

    if (!deleted) {
      return apiError("사용자를 찾을 수 없습니다.", { status: 404 });
    }

    return apiOk({}, { message: "계정이 삭제되었습니다." });
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "계정 삭제 중 오류가 발생했습니다.",
      { status: 500 }
    );
  }
}
