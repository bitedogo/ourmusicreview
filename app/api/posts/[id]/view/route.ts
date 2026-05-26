import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth/config";
import { initializeDatabase } from "@/src/lib/db";
import { Post } from "@/src/lib/db/entities/Post";

interface Params {
  id: string;
}

export async function POST(req: NextRequest, context: { params: Promise<Params> }) {
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json(
      { message: "Post ID is required" },
      { status: 400 }
    );
  }

  const session = await getServerSession(authOptions);

  try {
    const dataSource = await initializeDatabase();
    const postRepository = dataSource.getRepository(Post);

    const post = await postRepository.findOne({
      where: { id },
      select: ["userId"], // 작성자 ID만 가져옵니다.
    });

    if (post && session?.user?.id === post.userId) {
      return NextResponse.json({ ok: true, message: "Author viewing own post" });
    }

    await postRepository.increment({ id }, "views", 1);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error incrementing post views:", error);
    return NextResponse.json(
      { message: "Failed to increment views" },
      { status: 500 }
    );
  }
}
