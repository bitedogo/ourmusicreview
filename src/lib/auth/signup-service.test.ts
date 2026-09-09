import { describe, expect, it, vi } from "vitest";
import type { DataSource, EntityManager } from "typeorm";
import { BlockedEmail } from "@/src/lib/db/entities/BlockedEmail";
import { User } from "@/src/lib/db/entities/User";
import { createVerifiedUser, isUniqueViolation } from "./signup-service";

function createFixture(challengeRows: Array<{ email: string }>) {
  const userRepository = {
    findOne: vi.fn().mockResolvedValue(null),
    create: vi.fn((value) => value),
    save: vi.fn().mockResolvedValue(undefined),
  };
  const blockedEmailRepository = {
    findOne: vi.fn().mockResolvedValue(null),
  };
  const manager = {
    getRepository: vi.fn((entity: unknown) =>
      entity === User ? userRepository : entity === BlockedEmail ? blockedEmailRepository : null,
    ),
    query: vi.fn().mockResolvedValue(challengeRows),
  } as unknown as EntityManager;
  const transaction = vi.fn(
    async <T>(run: (entityManager: EntityManager) => Promise<T>): Promise<T> =>
      run(manager),
  );

  return {
    dataSource: { transaction } as unknown as DataSource,
    transaction,
    manager,
    userRepository,
  };
}

const input = {
  id: "new-user",
  passwordHash: "hash",
  name: "이름",
  nickname: "닉네임",
  email: "user@example.com",
  profileImage: null,
  gender: "NONE" as const,
};

describe("createVerifiedUser", () => {
  it("challenge 소비와 사용자 생성을 같은 트랜잭션에서 처리한다", async () => {
    const fixture = createFixture([{ email: input.email }]);

    await expect(createVerifiedUser(fixture.dataSource, input)).resolves.toBeUndefined();

    expect(fixture.transaction).toHaveBeenCalledOnce();
    expect(fixture.manager.query).toHaveBeenCalledWith(
      expect.stringContaining("DELETE FROM public.email_otp_challenges"),
      expect.any(Array),
    );
    expect(fixture.userRepository.save).toHaveBeenCalledOnce();
  });

  it("다른 요청이 challenge를 먼저 소비했으면 사용자를 생성하지 않는다", async () => {
    const fixture = createFixture([]);

    await expect(createVerifiedUser(fixture.dataSource, input)).rejects.toMatchObject({
      status: 400,
    });
    expect(fixture.userRepository.save).not.toHaveBeenCalled();
  });
});

describe("isUniqueViolation", () => {
  it("TypeORM에 감싸진 PostgreSQL unique violation도 판별한다", () => {
    expect(isUniqueViolation({ driverError: { code: "23505" } })).toBe(true);
    expect(isUniqueViolation(new Error("other"))).toBe(false);
  });
});
