/** POST 관리자 회원 경고·일시 정지·정지 해제 */

import { requireAdminApi } from "@/src/lib/auth/session";
import { initializeDatabase } from "@/src/lib/db";
import { handleRouteError } from "@/src/lib/http/handle-route-error";
import { apiError, apiOk } from "@/src/lib/http/response";
import {
  listUserSanctions,
  suspendMember,
  toSanctionPublicFields,
  unsuspendMember,
  warnMember,
} from "@/src/lib/users/user-sanction-service";

interface SanctionBody {
  action?: "warn" | "suspend" | "unsuspend";
  reason?: string;
  suspendedUntil?: string;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { session, response } = await requireAdminApi();
    if (response) return response;

    const { id } = await params;
    if (!id) {
      return apiError("멤버 ID가 필요합니다.", { status: 400 });
    }

    const body = (await request.json()) as SanctionBody;
    const reason = typeof body.reason === "string" ? body.reason : "";
    const dataSource = await initializeDatabase();

    let user;
    if (body.action === "warn") {
      user = await warnMember(dataSource, session.user.id, id, reason);
    } else if (body.action === "suspend") {
      if (typeof body.suspendedUntil !== "string" || !body.suspendedUntil) {
        return apiError("정지 해제 일시를 지정해주세요.", { status: 400 });
      }
      user = await suspendMember(
        dataSource,
        session.user.id,
        id,
        reason,
        body.suspendedUntil
      );
    } else if (body.action === "unsuspend") {
      user = await unsuspendMember(dataSource, session.user.id, id, reason);
    } else {
      return apiError(
        "action은 warn, suspend, unsuspend 중 하나여야 합니다.",
        { status: 400 }
      );
    }

    const sanctions = await listUserSanctions(dataSource, id);

    return apiOk(
      {
        member: {
          id: user.id,
          ...toSanctionPublicFields(user),
        },
        sanctions,
      },
      {
        message:
          body.action === "warn"
            ? "경고가 부여되었습니다."
            : body.action === "suspend"
              ? "계정이 일시 정지되었습니다."
              : "정지가 해제되었습니다.",
      }
    );
  } catch (error) {
    return handleRouteError(error, "제재 처리 중 오류가 발생했습니다.");
  }
}
