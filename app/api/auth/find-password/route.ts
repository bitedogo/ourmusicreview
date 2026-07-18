/** POST 비밀번호 찾기·재설정 */

import bcrypt from "bcryptjs";
import { initializeDatabase } from "@/src/lib/db";
import { User } from "@/src/lib/db/entities/User";
import { apiError, apiOk } from "@/src/lib/http/response";

function generateTemporaryPassword(): string {
  const chars = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email.trim() : "";
    const id = typeof body?.id === "string" ? body.id.trim() : "";

    if (!email || !id) {
      return apiError("이메일과 아이디를 모두 입력해주세요.", { status: 400 });
    }

    const dataSource = await initializeDatabase();
    const userRepository = dataSource.getRepository(User);

    const user = await userRepository.findOne({
      where: { id, email },
    });

    if (!user) {
      return apiError("이메일과 아이디가 일치하는 계정이 없습니다.", { status: 404 });
    }

    const temporaryPassword = generateTemporaryPassword();
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    await userRepository.update({ id: user.id }, { password: hashedPassword });

    return apiOk({ temporaryPassword });
  } catch {
    return apiError("비밀번호 재설정 중 오류가 발생했습니다.", { status: 500 });
  }
}
