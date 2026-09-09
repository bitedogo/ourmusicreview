import { describe, expect, it, vi } from "vitest";
import type { DataSource, EntityManager } from "typeorm";
import { BlockedEmail } from "@/src/lib/db/entities/BlockedEmail";
import { Comment } from "@/src/lib/db/entities/Comment";
import { Like } from "@/src/lib/db/entities/Like";
import { Report } from "@/src/lib/db/entities/Report";
import { Review } from "@/src/lib/db/entities/Review";
import { User } from "@/src/lib/db/entities/User";
import { UserFavoriteAlbum } from "@/src/lib/db/entities/UserFavoriteAlbum";
import { deleteUserAccount } from "./user-deletion";

function createFixture(options?: { missingUser?: boolean; failOnReport?: boolean }) {
  const user = {
    id: "target",
    email: "User@Example.com",
  } as User;
  const userRepository = {
    findOne: vi.fn().mockResolvedValue(options?.missingUser ? null : user),
    remove: vi.fn().mockResolvedValue(user),
  };
  const blockedEmailRepository = {
    findOne: vi.fn().mockResolvedValue(null),
    create: vi.fn((value) => value),
    save: vi.fn().mockResolvedValue(undefined),
  };
  const repositories = new Map<unknown, { delete: ReturnType<typeof vi.fn> }>();
  for (const entity of [UserFavoriteAlbum, Like, Comment, Review]) {
    repositories.set(entity, { delete: vi.fn().mockResolvedValue(undefined) });
  }
  repositories.set(Report, {
    delete: options?.failOnReport
      ? vi.fn().mockRejectedValue(new Error("delete failed"))
      : vi.fn().mockResolvedValue(undefined),
  });

  const manager = {
    getRepository: vi.fn((entity: unknown) => {
      if (entity === User) return userRepository;
      if (entity === BlockedEmail) return blockedEmailRepository;
      return repositories.get(entity);
    }),
  } as unknown as EntityManager;
  const transaction = vi.fn(
    async <T>(run: (entityManager: EntityManager) => Promise<T>): Promise<T> =>
      run(manager),
  );
  const dataSource = { transaction } as unknown as DataSource;

  return {
    dataSource,
    transaction,
    userRepository,
    blockedEmailRepository,
    repositories,
  };
}

describe("deleteUserAccount", () => {
  it("삭제와 이메일 차단을 같은 트랜잭션 관리자에서 처리한다", async () => {
    const fixture = createFixture();

    await expect(
      deleteUserAccount(fixture.dataSource, "target", {
        blockEmail: true,
        blockedByAdminId: "admin",
      }),
    ).resolves.toBe(true);

    expect(fixture.transaction).toHaveBeenCalledOnce();
    expect(fixture.userRepository.remove).toHaveBeenCalledOnce();
    expect(fixture.blockedEmailRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "user@example.com",
        previousUserId: "target",
        blockedByAdminId: "admin",
      }),
    );
  });

  it("대상 사용자가 없으면 연관 데이터를 삭제하지 않는다", async () => {
    const fixture = createFixture({ missingUser: true });

    await expect(deleteUserAccount(fixture.dataSource, "missing")).resolves.toBe(false);

    for (const repository of fixture.repositories.values()) {
      expect(repository.delete).not.toHaveBeenCalled();
    }
    expect(fixture.userRepository.remove).not.toHaveBeenCalled();
  });

  it("중간 삭제가 실패하면 오류를 전파하고 이후 작업을 실행하지 않는다", async () => {
    const fixture = createFixture({ failOnReport: true });

    await expect(
      deleteUserAccount(fixture.dataSource, "target", { blockEmail: true }),
    ).rejects.toThrow("delete failed");

    expect(fixture.userRepository.remove).not.toHaveBeenCalled();
    expect(fixture.blockedEmailRepository.save).not.toHaveBeenCalled();
  });
});
