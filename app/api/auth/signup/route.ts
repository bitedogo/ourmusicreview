/** POST 회원가입 — 사전 이메일 인증 필수 */

import bcrypt from "bcryptjs";
import {
  EMAIL_AUTH_MESSAGES,
  assertSignupEmailVerified,
  consumeSignupEmailChallenge,
  getUserRepository,
} from "@/src/lib/auth/email-otp";
import { validateUserId } from "@/src/lib/auth/user-id";
import {
  sanitizeText,
  validateEmail,
  validateName,
  validateNickname,
  validatePassword,
} from "@/src/lib/auth/validation";
import { apiError, apiOk } from "@/src/lib/http/response";
import { uploadProfileImage } from "@/src/lib/supabase";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const id = sanitizeText(formData.get("id"));
    const password = sanitizeText(formData.get("password"));
    const email = sanitizeText(formData.get("email")).toLowerCase();
    const name = sanitizeText(formData.get("name"));
    const nickname = sanitizeText(formData.get("nickname"));
    const genderRaw = sanitizeText(formData.get("gender"));
    const profileImage = formData.get("profileImage") as File | null;

    const validGenders = ["MALE", "FEMALE", "NONE"] as const;
    const gender = validGenders.includes(
      genderRaw as (typeof validGenders)[number]
    )
      ? (genderRaw as (typeof validGenders)[number])
      : null;

    if (!id || !password || !email || !name || !nickname || !gender) {
      return apiError(
        "모든 필수 항목(아이디, 비밀번호, 이메일, 이름, 닉네임, 성별)을 입력해주세요.",
        { status: 400 }
      );
    }

    const idError = validateUserId(id);
    if (idError) return apiError(idError, { status: 400 });

    const pwdError = validatePassword(password);
    if (pwdError) return apiError(pwdError, { status: 400 });

    const emailError = validateEmail(email);
    if (emailError) return apiError(emailError, { status: 400 });

    const nickError = validateNickname(nickname);
    if (nickError) return apiError(nickError, { status: 400 });

    const nameError = validateName(name);
    if (nameError) return apiError(nameError, { status: 400 });

    try {
      await assertSignupEmailVerified(email);
    } catch (error) {
      return apiError(
        error instanceof Error
          ? error.message
          : EMAIL_AUTH_MESSAGES.signupEmailNotVerified,
        { status: 400 }
      );
    }

    let profileImagePath: string | null = null;
    if (profileImage && profileImage.size > 0) {
      if (profileImage.size > 5 * 1024 * 1024) {
        return apiError("파일 용량은 5MB 이하여야 합니다.", { status: 400 });
      }

      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedTypes.includes(profileImage.type)) {
        return apiError("지원하는 이미지 형식: JPEG, PNG, GIF, WebP", {
          status: 400,
        });
      }

      try {
        profileImagePath = await uploadProfileImage(profileImage, "signup");
      } catch {
        return apiError("프로필 이미지 업로드 중 오류가 발생했습니다.", {
          status: 500,
        });
      }
    }

    const userRepository = await getUserRepository();

    if (await userRepository.findOne({ where: { id } })) {
      return apiError("이미 존재하는 아이디입니다.", { status: 409 });
    }
    if (await userRepository.findOne({ where: { email } })) {
      return apiError("이미 사용 중인 이메일입니다.", { status: 409 });
    }
    if (await userRepository.findOne({ where: { nickname } })) {
      return apiError("이미 사용 중인 닉네임입니다.", { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = userRepository.create({
      id,
      password: hashedPassword,
      name,
      nickname,
      email,
      profileImage: profileImagePath,
      role: "USER",
      gender,
      emailVerifiedAt: new Date(),
      emailVerificationToken: null,
      emailVerificationExpiresAt: null,
      passwordResetToken: null,
      passwordResetExpiresAt: null,
    });

    await userRepository.save(newUser);
    await consumeSignupEmailChallenge(email);

    return apiOk(
      {},
      {
        status: 201,
        message: "회원가입이 완료되었습니다. 로그인해 주세요.",
      }
    );
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "회원가입 중 오류가 발생했습니다.",
      { status: 500 }
    );
  }
}
