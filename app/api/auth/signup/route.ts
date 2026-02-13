import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { initializeDatabase } from "@/src/lib/db";
import { User } from "@/src/lib/db/entities/User";
import { uploadProfileImage } from "@/src/lib/supabase";

function sanitizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function validatePassword(pwd: string): string | null {
  if (pwd.length < 6) {
    return "비밀번호는 6자리 이상이어야 합니다.";
  }
  if (!/.*[a-zA-Z].*/.test(pwd) || !/.*[0-9].*/.test(pwd)) {
    return "비밀번호는 영문과 숫자를 반드시 포함해야 합니다.";
  }
  return null;
}

function validateNickname(nick: string): string | null {
  if (!nick) return "닉네임을 입력해주세요.";
  if (/[^a-zA-Z0-9가-힣]/.test(nick)) {
    return "특수문자 및 공백 사용불가";
  }
  const koreanCount = (nick.match(/[가-힣]/g) || []).length;
  const englishCount = (nick.match(/[a-zA-Z]/g) || []).length;
  const otherCount = nick.length - koreanCount - englishCount;
  if (koreanCount > 0 && koreanCount > 6) {
    return "최대 글자 수: 한글 6자";
  }
  if (englishCount + otherCount > 12) {
    return "최대 글자 수: 영문 12자";
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const id = sanitizeText(formData.get("id"));
    const password = sanitizeText(formData.get("password"));
    const email = sanitizeText(formData.get("email"));
    const nickname = sanitizeText(formData.get("nickname"));
    const profileImage = formData.get("profileImage") as File | null;

    if (!id || !password || !email || !nickname) {
      return NextResponse.json(
        { ok: false, error: "모든 필수 항목을 입력해주세요." },
        { status: 400 }
      );
    }

    const pwdError = validatePassword(password);
    if (pwdError) {
      return NextResponse.json({ ok: false, error: pwdError }, { status: 400 });
    }

    const nickError = validateNickname(nickname);
    if (nickError) {
      return NextResponse.json({ ok: false, error: nickError }, { status: 400 });
    }

    // 프로필 사진 검증 및 Supabase Storage 업로드 (선택사항)
    let profileImagePath: string | null = null;
    if (profileImage && profileImage.size > 0) {
      if (profileImage.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { ok: false, error: "파일 용량은 5MB 이하여야 합니다." },
          { status: 400 }
        );
      }

      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
      if (!allowedTypes.includes(profileImage.type)) {
        return NextResponse.json(
          { ok: false, error: "지원하는 이미지 형식: JPEG, PNG, GIF, WebP" },
          { status: 400 }
        );
      }

      try {
        profileImagePath = await uploadProfileImage(profileImage, "signup");
      } catch {
        return NextResponse.json(
          { ok: false, error: "프로필 이미지 업로드 중 오류가 발생했습니다." },
          { status: 500 }
        );
      }
    }

    const dataSource = await initializeDatabase();
    const userRepository = dataSource.getRepository(User);

    // 아이디 중복 검사
    const existingById = await userRepository.findOne({ where: { id } });
    if (existingById) {
      return NextResponse.json(
        { ok: false, error: "이미 존재하는 아이디입니다." },
        { status: 409 }
      );
    }

    // 이메일 중복 검사
    const existingByEmail = await userRepository.findOne({ where: { email } });
    if (existingByEmail) {
      return NextResponse.json(
        { ok: false, error: "이미 사용 중인 이메일입니다." },
        { status: 409 }
      );
    }

    // 닉네임 중복 검사
    const existingByNickname = await userRepository.findOne({ where: { nickname } });
    if (existingByNickname) {
      return NextResponse.json(
        { ok: false, error: "이미 사용 중인 닉네임입니다." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = userRepository.create({
      id,
      password: hashedPassword,
      nickname,
      email,
      profileImage: profileImagePath,
      role: "USER",
    });

    await userRepository.save(newUser);

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "회원가입 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

