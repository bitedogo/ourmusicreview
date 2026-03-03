import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth/config";
import { initializeDatabase } from "@/src/lib/db";
import { User } from "@/src/lib/db/entities/User";
import { uploadProfileImage } from "@/src/lib/supabase";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { ok: false, error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const profileImage = formData.get("profileImage") as File | null;

    if (!profileImage || profileImage.size === 0) {
      return NextResponse.json(
        { ok: false, error: "업로드할 프로필 이미지를 선택해주세요." },
        { status: 400 }
      );
    }

    if (profileImage.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { ok: false, error: "파일 용량은 5MB 이하여야 합니다." },
        { status: 400 }
      );
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(profileImage.type)) {
      return NextResponse.json(
        {
          ok: false,
          error: "지원하는 이미지 형식: JPEG, PNG, GIF, WebP",
        },
        { status: 400 }
      );
    }

    const profileImagePath = await uploadProfileImage(
      profileImage,
      session.user.id
    );

    const dataSource = await initializeDatabase();
    const userRepository = dataSource.getRepository(User);

    const user = await userRepository.findOne({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json(
        { ok: false, error: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    user.profileImage = profileImagePath;
    await userRepository.save(user);

    return NextResponse.json(
      {
        ok: true,
        profileImage: user.profileImage,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "프로필 이미지 변경 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

