/** POST/GET 댓글 작성·목록 */

import { revalidatePath } from "next/cache";
import { getAppSession, requireWritableSessionApi } from "@/src/lib/auth/session";
import {
  createComment,
  listComments,
} from "@/src/lib/comments/comment-service";
import { withDatabase, withDatabaseRead } from "@/src/lib/db";
import { handleRouteError } from "@/src/lib/http/handle-route-error";
import { apiOk } from "@/src/lib/http/response";

export async function POST(request: Request) {
  try {
    const { session, response } = await requireWritableSessionApi();
    if (response) return response;

    const body = await request.json();
    const comment = await withDatabase((dataSource) =>
      createComment(dataSource, session.user.id, body)
    );
    if (typeof body.playlistId === "string") {
      revalidatePath(`/playlist/${body.playlistId}`);
      revalidatePath("/playlist");
    }
    if (typeof body.reviewId === "string") {
      revalidatePath(`/review/${body.reviewId}`);
      revalidatePath("/reviews");
    }
    if (typeof body.postId === "string") {
      revalidatePath(`/community/${body.postId}`);
    }

    return apiOk({ comment }, { status: 201 });
  } catch (error) {
    return handleRouteError(error, "댓글 작성 중 오류가 발생했습니다.");
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const session = await getAppSession();

    const result = await withDatabaseRead((dataSource) =>
      listComments(dataSource, {
        postId: searchParams.get("postId"),
        reviewId: searchParams.get("reviewId"),
        playlistId: searchParams.get("playlistId"),
        viewerUserId: session?.user?.id ?? null,
        page: searchParams.get("page"),
        pageSize: searchParams.get("pageSize"),
      })
    );

    return apiOk(result);
  } catch (error) {
    return handleRouteError(error, "댓글 조회 중 오류가 발생했습니다.");
  }
}
