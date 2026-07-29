/** PATCH/GET 프로필 공개 설정 */

import { requireSessionApi } from "@/src/lib/auth/session";
import { initializeDatabase } from "@/src/lib/db";
import { User } from "@/src/lib/db/entities/User";
import { apiError, apiOk } from "@/src/lib/http/response";
import {
  PRIVACY_KEYS,
  privacyUpdatesFromBody,
  toPrivacySettings,
  type PrivacyKey,
} from "@/src/lib/profile/privacy";

type PrivacyBody = Partial<Record<PrivacyKey, boolean>>;

export async function PATCH(request: Request) {
  try {
    const { session, response } = await requireSessionApi();
    if (response) return response;

    const body = (await request.json()) as PrivacyBody;
    const updates = privacyUpdatesFromBody(body);

    if (Object.keys(updates).length === 0) {
      return apiError("변경할 공개 설정이 없습니다.", { status: 400 });
    }

    const dataSource = await initializeDatabase();
    const userRepository = dataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: session.user.id } });

    if (!user) {
      return apiError("사용자를 찾을 수 없습니다.", { status: 404 });
    }

    Object.assign(user, updates);
    await userRepository.save(user);

    return apiOk({
      privacy: toPrivacySettings(user),
    });
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "공개 설정 저장 중 오류가 발생했습니다.",
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const { session, response } = await requireSessionApi();
    if (response) return response;

    const dataSource = await initializeDatabase();
    const userRepository = dataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: session.user.id },
      select: [...PRIVACY_KEYS],
    });

    if (!user) {
      return apiError("사용자를 찾을 수 없습니다.", { status: 404 });
    }

    return apiOk({
      privacy: toPrivacySettings(user),
    });
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "공개 설정 조회 중 오류가 발생했습니다.",
      { status: 500 },
    );
  }
}
