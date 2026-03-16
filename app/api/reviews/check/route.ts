import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth/config";
import { initializeDatabase } from "@/src/lib/db";
import { Review } from "@/src/lib/db/entities/Review";
import { apiError, apiOk } from "@/src/lib/http/response";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiError("로그인이 필요합니다.", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const albumId = searchParams.get("albumId")?.trim();
    if (!albumId) {
      return apiError("앨범 ID가 필요합니다.", { status: 400 });
    }

    const dataSource = await initializeDatabase();
    const reviewRepository = dataSource.getRepository(Review);
    const existing = await reviewRepository.findOne({
      where: {
        userId: session.user.id,
        albumId,
      },
      select: ["id"],
    });

    return apiOk({
      exists: Boolean(existing),
      reviewId: existing?.id ?? null,
    });
  } catch {
    return apiError("리뷰 중복 확인 중 오류가 발생했습니다.", { status: 500 });
  }
}
