import type { DataSource } from "typeorm";
import {
  consumeVerifiedSignupEmailChallenge,
  SIGNUP_EMAIL_NOT_VERIFIED_MESSAGE,
} from "./email-otp-consume";
import { User } from "@/src/lib/db/entities/User";
import { ServiceError } from "@/src/lib/http/service-error";
import {
  BLOCKED_EMAIL_MESSAGE,
  isEmailBlocked,
} from "@/src/lib/users/blocked-email";

export interface CreateVerifiedUserInput {
  id: string;
  passwordHash: string;
  name: string;
  nickname: string;
  email: string;
  profileImage: string | null;
  gender: "MALE" | "FEMALE" | "NONE";
}

export function isUniqueViolation(error: unknown): boolean {
  const candidate = error as {
    code?: string;
    driverError?: { code?: string };
  };
  return candidate.code === "23505" || candidate.driverError?.code === "23505";
}

export async function createVerifiedUser(
  dataSource: DataSource,
  input: CreateVerifiedUserInput,
): Promise<void> {
  await dataSource.transaction(async (manager) => {
    if (await isEmailBlocked(manager, input.email)) {
      throw new ServiceError(BLOCKED_EMAIL_MESSAGE, 403);
    }

    const userRepository = manager.getRepository(User);
    if (await userRepository.findOne({ where: { id: input.id } })) {
      throw new ServiceError("이미 존재하는 아이디입니다.", 409);
    }
    if (await userRepository.findOne({ where: { email: input.email } })) {
      throw new ServiceError("이미 사용 중인 이메일입니다.", 409);
    }
    if (await userRepository.findOne({ where: { nickname: input.nickname } })) {
      throw new ServiceError("이미 사용 중인 닉네임입니다.", 409);
    }

    const challengeConsumed = await consumeVerifiedSignupEmailChallenge(
      manager,
      input.email,
    );
    if (!challengeConsumed) {
      throw new ServiceError(SIGNUP_EMAIL_NOT_VERIFIED_MESSAGE, 400);
    }

    await userRepository.save(
      userRepository.create({
        id: input.id,
        password: input.passwordHash,
        name: input.name,
        nickname: input.nickname,
        email: input.email,
        profileImage: input.profileImage,
        role: "USER",
        gender: input.gender,
        emailVerifiedAt: new Date(),
        emailVerificationToken: null,
        emailVerificationExpiresAt: null,
        passwordResetToken: null,
        passwordResetExpiresAt: null,
      }),
    );
  });
}
