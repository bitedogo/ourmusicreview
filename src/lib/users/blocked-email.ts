/** 강제 탈퇴 이메일 재가입 차단 */

import type { DataSource } from "typeorm";
import { BlockedEmail } from "@/src/lib/db/entities/BlockedEmail";

export const BLOCKED_EMAIL_MESSAGE =
  "해당 이메일로는 회원가입할 수 없습니다. 관리자에게 문의해 주세요.";

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function isEmailBlocked(
  dataSource: DataSource,
  email: string
): Promise<boolean> {
  const normalized = normalizeEmail(email);
  if (!normalized) return false;
  const row = await dataSource.getRepository(BlockedEmail).findOne({
    where: { email: normalized },
  });
  return Boolean(row);
}

export async function assertEmailNotBlocked(
  dataSource: DataSource,
  email: string
): Promise<void> {
  if (await isEmailBlocked(dataSource, email)) {
    throw new Error(BLOCKED_EMAIL_MESSAGE);
  }
}

export async function blockEmail(
  dataSource: DataSource,
  input: {
    email: string;
    previousUserId?: string | null;
    blockedByAdminId?: string | null;
    reason?: string | null;
  }
): Promise<void> {
  const email = normalizeEmail(input.email);
  if (!email) return;

  const repo = dataSource.getRepository(BlockedEmail);
  const existing = await repo.findOne({ where: { email } });
  if (existing) {
    existing.previousUserId = input.previousUserId ?? existing.previousUserId;
    existing.blockedByAdminId =
      input.blockedByAdminId ?? existing.blockedByAdminId;
    existing.reason = input.reason ?? existing.reason;
    existing.blockedAt = new Date();
    await repo.save(existing);
    return;
  }

  await repo.save(
    repo.create({
      email,
      previousUserId: input.previousUserId ?? null,
      blockedByAdminId: input.blockedByAdminId ?? null,
      reason: input.reason ?? "관리자에 의한 계정 삭제",
    })
  );
}
