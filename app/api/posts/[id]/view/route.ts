/** POST 게시글 조회수 증가 */

import { NextRequest } from "next/server";
import { getAppSession } from "@/src/lib/auth/session";
import { initializeDatabase } from "@/src/lib/db";
import { Post } from "@/src/lib/db/entities/Post";
import { apiError, apiOk } from "@/src/lib/http/response";

interface Params {
  id: string;
}

export async function POST(req: NextRequest, context: { params: Promise<Params> }) {
  const { id } = await context.params;

  if (!id) {
    return apiError("Post ID is required", { status: 400 });
  }

  const session = await getAppSession();

  try {
    const dataSource = await initializeDatabase();
    const postRepository = dataSource.getRepository(Post);

    const post = await postRepository.findOne({
      where: { id },
      select: ["userId"],
    });

    if (post && session?.user?.id === post.userId) {
      return apiOk({ skipped: true });
    }

    await postRepository.increment({ id }, "views", 1);

    return apiOk({});
  } catch {
    return apiError("Failed to increment views", { status: 500 });
  }
}
