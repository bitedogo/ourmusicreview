/** POST 비밀번호 변경 */

import bcrypt from "bcryptjs";
import { isBcryptHash, sanitizeText, validatePassword } from "@/src/lib/auth/validation";
import { initializeDatabase } from "@/src/lib/db";
import { User } from "@/src/lib/db/entities/User";
import { apiError, apiOk } from "@/src/lib/http/response";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const id = sanitizeText(body?.id);
    const email = sanitizeText(body?.email);
    const currentPassword = sanitizeText(body?.currentPassword);
    const newPassword = sanitizeText(body?.newPassword);

    if (!id || !email || !currentPassword || !newPassword) {
      return apiError("아이디, 이메일, 현재 비밀번호, 새 비밀번호를 모두 입력해주세요.", {
        status: 400,
      });
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      return apiError(passwordError, { status: 400 });
    }

    if (currentPassword === newPassword) {
      return apiError("새 비밀번호는 현재 비밀번호와 달라야 합니다.", { status: 400 });
    }

    const dataSource = await initializeDatabase();
    const userRepository = dataSource.getRepository(User);

    const user = await userRepository.findOne({ where: { id, email } });
    if (!user) {
      return apiError("입력한 아이디와 이메일이 일치하는 계정을 찾을 수 없습니다.", {
        status: 404,
      });
    }

    if (typeof user.password !== "string" || !user.password) {
      return apiError("비밀번호 로그인 계정이 아니거나 비밀번호 정보가 없습니다.", {
        status: 400,
      });
    }

    const currentPasswordHash = user.password;
    const isHashed = isBcryptHash(currentPasswordHash);
    const isCurrentPasswordValid = isHashed
      ? await bcrypt.compare(currentPassword, currentPasswordHash)
      : currentPassword === currentPasswordHash;

    if (!isCurrentPasswordValid) {
      return apiError("현재 비밀번호가 올바르지 않습니다.", { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await userRepository.update({ id: user.id }, { password: hashedPassword });

    return apiOk({});
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "비밀번호 변경 중 오류가 발생했습니다.",
      { status: 500 }
    );
  }
}
