import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { initializeDatabase } from "@/src/lib/db";
import { User } from "@/src/lib/db/entities/User";

function sanitizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isBcryptHash(value: string) {
  return /^\$2[aby]\$\d{2}\$/.test(value);
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const id = sanitizeText(body?.id);
    const email = sanitizeText(body?.email);
    const currentPassword = sanitizeText(body?.currentPassword);
    const newPassword = sanitizeText(body?.newPassword);

    if (!id || !email || !currentPassword || !newPassword) {
      return NextResponse.json(
        { ok: false, error: "아이디, 이메일, 현재 비밀번호, 새 비밀번호를 모두 입력해주세요." },
        { status: 400 }
      );
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      return NextResponse.json({ ok: false, error: passwordError }, { status: 400 });
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { ok: false, error: "새 비밀번호는 현재 비밀번호와 달라야 합니다." },
        { status: 400 }
      );
    }

    const dataSource = await initializeDatabase();
    const userRepository = dataSource.getRepository(User);

    const user = await userRepository.findOne({ where: { id, email } });
    if (!user) {
      return NextResponse.json(
        { ok: false, error: "입력한 아이디와 이메일이 일치하는 계정을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const isHashed = isBcryptHash(user.password);
    const isCurrentPasswordValid = isHashed
      ? await bcrypt.compare(currentPassword, user.password)
      : currentPassword === user.password;

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { ok: false, error: "현재 비밀번호가 올바르지 않습니다." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await userRepository.update({ id: user.id }, { password: hashedPassword });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "비밀번호 변경 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
