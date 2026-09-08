import { randomUUID } from "node:crypto";
import type { DataSource } from "typeorm";
import { User } from "@/src/lib/db/entities/User";
import { UserIdentity } from "@/src/lib/db/entities/UserIdentity";
import { isEmailBlocked } from "@/src/lib/users/blocked-email";
import { ServiceError } from "@/src/lib/http/service-error";

interface ResolveIdentityInput {
  provider: "google" | "supabase";
  providerSubject: string;
  email: string;
  nickname: string;
  profileImage: string | null;
}

export async function resolveExternalIdentity(
  dataSource: DataSource,
  input: ResolveIdentityInput
): Promise<User> {
  const email = input.email.trim().toLowerCase();
  if (!email || !input.providerSubject) {
    throw new ServiceError("인증 공급자 정보가 올바르지 않습니다.", 400);
  }
  const blocked = await isEmailBlocked(dataSource, email);

  return dataSource.transaction(async (manager) => {
    const identityRepository = manager.getRepository(UserIdentity);
    const existingIdentity = await identityRepository.findOne({
      where: {
        provider: input.provider,
        providerSubject: input.providerSubject,
      },
      relations: ["user"],
    });
    if (existingIdentity?.user) return existingIdentity.user;

    const userRepository = manager.getRepository(User);
    let user = await userRepository.findOne({ where: { email } });
    if (!user) {
      if (blocked) {
        throw new ServiceError("가입할 수 없는 이메일입니다.", 403);
      }
      user = userRepository.create({
        id: randomUUID().replace(/-/g, "").slice(0, 50),
        email,
        nickname: input.nickname.trim().slice(0, 50) || email.split("@")[0],
        profileImage: input.profileImage,
        role: "USER",
        emailVerifiedAt: new Date(),
      });
      await userRepository.save(user);
    } else {
      let changed = false;
      if (!user.emailVerifiedAt) {
        user.emailVerifiedAt = new Date();
        changed = true;
      }
      if (input.profileImage && input.profileImage !== user.profileImage) {
        user.profileImage = input.profileImage;
        changed = true;
      }
      if (changed) await userRepository.save(user);
    }

    await identityRepository
      .createQueryBuilder()
      .insert()
      .into(UserIdentity)
      .values({
        id: randomUUID().replace(/-/g, "").slice(0, 50),
        userId: user.id,
        provider: input.provider,
        providerSubject: input.providerSubject,
      })
      .orIgnore()
      .execute();

    const linked = await identityRepository.findOne({
      where: {
        provider: input.provider,
        providerSubject: input.providerSubject,
      },
    });
    if (!linked || linked.userId !== user.id) {
      throw new ServiceError("이미 다른 계정에 연결된 인증 정보입니다.", 409);
    }
    return user;
  });
}
