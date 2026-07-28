/** JWT 토큰 발급 시 DB에서 최신 프로필 이미지 조회 */

import { initializeDatabase } from "../db";
import { User } from "../db/entities/User";

export async function resolveProfileImageFromDb(
  userId: string,
  fallback?: string | null
): Promise<string | null> {
  try {
    const dataSource = await initializeDatabase();
    const userRepository = dataSource.getRepository(User);
    const dbUser = await userRepository.findOne({ where: { id: userId } });
    return dbUser?.profileImage ?? fallback ?? null;
  } catch {
    return fallback ?? null;
  }
}
