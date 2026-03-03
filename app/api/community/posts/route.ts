import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth/config";
import { initializeDatabase } from "@/src/lib/db";
import { Post, PostCategory } from "@/src/lib/db/entities/Post";
import { randomUUID } from "crypto";

interface CreatePostBody {
  title?: string;
  content?: string;
  category?: PostCategory;
  isGlobal?: boolean;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !session.user.name) {
      return NextResponse.json(
        { ok: false, error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const body = (await request.json()) as CreatePostBody;
    const title =
      typeof body.title === "string" ? body.title.trim() : undefined;
    const content =
      typeof body.content === "string" ? body.content.trim() : undefined;

    const isAdmin = (session.user as { role?: string }).role === "ADMIN";
    const isGlobal = isAdmin && body.isGlobal === true ? "Y" : "N";

    const allowedCategories: PostCategory[] = ["K", "I", "M", "W"];
    const category: PostCategory = allowedCategories.includes(
      body.category as PostCategory
    )
      ? (body.category as PostCategory)
      : "K";

    if (!title || !content) {
      return NextResponse.json(
        { ok: false, error: "제목과 내용을 모두 입력해주세요." },
        { status: 400 }
      );
    }

    const dataSource = await initializeDatabase();
    const postRepository = dataSource.getRepository(Post);

    const id = randomUUID().replace(/-/g, "").slice(0, 24);

    const post = postRepository.create({
      id,
      title,
      content,
      category,
      isGlobal,
      userId: session.user.id!,
      nickname: session.user.name ?? "",
    });

    await postRepository.save(post);

    return NextResponse.json({ ok: true, id: post.id }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "게시글 작성 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}

