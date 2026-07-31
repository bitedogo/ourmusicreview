/** 비밀번호 해시 검증 */

import bcrypt from "bcryptjs";
import { isBcryptHash } from "@/src/lib/auth/validation";

export async function verifyPassword(
  plainPassword: string,
  storedPassword: string
): Promise<boolean> {
  if (isBcryptHash(storedPassword)) {
    return bcrypt.compare(plainPassword, storedPassword);
  }
  return plainPassword === storedPassword;
}
