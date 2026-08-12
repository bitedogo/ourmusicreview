/** 회원 경고·일시 정지 서비스 */

import { randomUUID } from "crypto";
import type { DataSource, Repository } from "typeorm";
import { User } from "@/src/lib/db/entities/User";
import {
  UserSanction,
  type UserSanctionAction,
} from "@/src/lib/db/entities/UserSanction";
import { ServiceError } from "@/src/lib/http/service-error";

export type AccountStatus = "ACTIVE" | "WARNED" | "SUSPENDED";

export interface SuspensionInfo {
  suspended: true;
  until: Date | null;
  reason: string | null;
  message: string;
}

export interface SanctionLogItem {
  id: string;
  action: UserSanctionAction;
  reason: string;
  suspendedUntil: string | null;
  adminId: string;
  createdAt: string;
}

function createSanctionId(): string {
  return randomUUID().replace(/-/g, "").slice(0, 24);
}

export function formatSuspensionMessage(
  until: Date | null,
  reason: string | null
): string {
  const untilText = until
    ? until.toLocaleString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "별도 안내 시까지";
  const reasonText = reason?.trim() ? ` 사유: ${reason.trim()}` : "";
  return `계정이 일시 정지되었습니다. 정지 해제 예정: ${untilText}.${reasonText}`;
}

function statusAfterWarnings(warningCount: number): AccountStatus {
  return warningCount > 0 ? "WARNED" : "ACTIVE";
}

/**
 * 정지 기간이 지났으면 ACTIVE/WARNED로 자동 복구한다.
 * 변경이 있으면 DB에 저장한다.
 */
export async function refreshExpiredSuspension(
  userRepo: Repository<User>,
  user: User
): Promise<User> {
  if (user.accountStatus !== "SUSPENDED") {
    return user;
  }

  const until = user.suspendedUntil ? new Date(user.suspendedUntil) : null;
  if (until && until.getTime() > Date.now()) {
    return user;
  }

  user.accountStatus = statusAfterWarnings(user.warningCount ?? 0);
  user.suspendedUntil = null;
  user.suspendReason = null;
  await userRepo.save(user);
  return user;
}

export async function getSuspensionBlockForUser(
  dataSource: DataSource,
  userId: string
): Promise<SuspensionInfo | null> {
  const userRepo = dataSource.getRepository(User);
  const user = await userRepo.findOne({ where: { id: userId } });
  if (!user) return null;

  await refreshExpiredSuspension(userRepo, user);

  if (user.accountStatus !== "SUSPENDED") {
    return null;
  }

  return {
    suspended: true,
    until: user.suspendedUntil ? new Date(user.suspendedUntil) : null,
    reason: user.suspendReason ?? null,
    message: formatSuspensionMessage(
      user.suspendedUntil ? new Date(user.suspendedUntil) : null,
      user.suspendReason ?? null
    ),
  };
}

export async function assertUserNotSuspended(
  dataSource: DataSource,
  user: User
): Promise<void> {
  const userRepo = dataSource.getRepository(User);
  await refreshExpiredSuspension(userRepo, user);
  if (user.accountStatus === "SUSPENDED") {
    throw new ServiceError(
      formatSuspensionMessage(
        user.suspendedUntil ? new Date(user.suspendedUntil) : null,
        user.suspendReason ?? null
      ),
      403
    );
  }
}

async function appendSanctionLog(
  dataSource: DataSource,
  input: {
    userId: string;
    adminId: string;
    action: UserSanctionAction;
    reason: string;
    suspendedUntil?: Date | null;
  }
): Promise<UserSanction> {
  const repo = dataSource.getRepository(UserSanction);
  const row = repo.create({
    id: createSanctionId(),
    userId: input.userId,
    adminId: input.adminId,
    action: input.action,
    reason: input.reason,
    suspendedUntil: input.suspendedUntil ?? null,
  });
  return repo.save(row);
}

export async function listUserSanctions(
  dataSource: DataSource,
  userId: string,
  limit = 20
): Promise<SanctionLogItem[]> {
  const rows = await dataSource.getRepository(UserSanction).find({
    where: { userId },
    order: { createdAt: "DESC" },
    take: limit,
  });

  return rows.map((row) => ({
    id: row.id,
    action: row.action,
    reason: row.reason,
    suspendedUntil: row.suspendedUntil
      ? new Date(row.suspendedUntil).toISOString()
      : null,
    adminId: row.adminId,
    createdAt: new Date(row.createdAt).toISOString(),
  }));
}

function assertCanSanctionTarget(target: User, adminId: string): void {
  if (target.id === adminId) {
    throw new ServiceError("자기 자신은 제재할 수 없습니다.", 400);
  }
  if (target.role === "ADMIN") {
    throw new ServiceError("관리자 계정은 제재할 수 없습니다.", 400);
  }
}

export async function warnMember(
  dataSource: DataSource,
  adminId: string,
  userId: string,
  reason: string
): Promise<User> {
  const trimmed = reason.trim();
  if (!trimmed) {
    throw new ServiceError("경고 사유를 입력해주세요.", 400);
  }

  const userRepo = dataSource.getRepository(User);
  const user = await userRepo.findOne({ where: { id: userId } });
  if (!user) {
    throw new ServiceError("멤버를 찾을 수 없습니다.", 404);
  }

  assertCanSanctionTarget(user, adminId);
  await refreshExpiredSuspension(userRepo, user);

  user.warningCount = (user.warningCount ?? 0) + 1;
  if (user.accountStatus !== "SUSPENDED") {
    user.accountStatus = "WARNED";
  }

  await userRepo.save(user);
  await appendSanctionLog(dataSource, {
    userId,
    adminId,
    action: "WARN",
    reason: trimmed,
  });

  return user;
}

export async function suspendMember(
  dataSource: DataSource,
  adminId: string,
  userId: string,
  reason: string,
  suspendedUntilIso: string
): Promise<User> {
  const trimmed = reason.trim();
  if (!trimmed) {
    throw new ServiceError("정지 사유를 입력해주세요.", 400);
  }

  const until = new Date(suspendedUntilIso);
  if (Number.isNaN(until.getTime())) {
    throw new ServiceError("정지 해제 일시가 올바르지 않습니다.", 400);
  }
  if (until.getTime() <= Date.now()) {
    throw new ServiceError("정지 해제 일시는 현재 이후여야 합니다.", 400);
  }

  const maxMs = 1000 * 60 * 60 * 24 * 365;
  if (until.getTime() - Date.now() > maxMs) {
    throw new ServiceError("정지 기간은 최대 1년까지 가능합니다.", 400);
  }

  const userRepo = dataSource.getRepository(User);
  const user = await userRepo.findOne({ where: { id: userId } });
  if (!user) {
    throw new ServiceError("멤버를 찾을 수 없습니다.", 404);
  }

  assertCanSanctionTarget(user, adminId);

  user.accountStatus = "SUSPENDED";
  user.suspendedUntil = until;
  user.suspendReason = trimmed;

  await userRepo.save(user);
  await appendSanctionLog(dataSource, {
    userId,
    adminId,
    action: "SUSPEND",
    reason: trimmed,
    suspendedUntil: until,
  });

  return user;
}

export async function unsuspendMember(
  dataSource: DataSource,
  adminId: string,
  userId: string,
  reason: string
): Promise<User> {
  const trimmed = reason.trim() || "정지 해제";

  const userRepo = dataSource.getRepository(User);
  const user = await userRepo.findOne({ where: { id: userId } });
  if (!user) {
    throw new ServiceError("멤버를 찾을 수 없습니다.", 404);
  }

  assertCanSanctionTarget(user, adminId);

  if (user.accountStatus !== "SUSPENDED") {
    throw new ServiceError("정지 상태가 아닙니다.", 400);
  }

  user.accountStatus = statusAfterWarnings(user.warningCount ?? 0);
  user.suspendedUntil = null;
  user.suspendReason = null;

  await userRepo.save(user);
  await appendSanctionLog(dataSource, {
    userId,
    adminId,
    action: "UNSUSPEND",
    reason: trimmed,
  });

  return user;
}

export function toSanctionPublicFields(user: User) {
  return {
    accountStatus: user.accountStatus ?? "ACTIVE",
    warningCount: user.warningCount ?? 0,
    suspendedUntil: user.suspendedUntil
      ? new Date(user.suspendedUntil).toISOString()
      : null,
    suspendReason: user.suspendReason ?? null,
  };
}
