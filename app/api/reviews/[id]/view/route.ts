/** POST 리뷰 조회수 증가 */

import { NextRequest } from "next/server";
import { getAppSession } from "@/src/lib/auth/session";
import { initializeDatabase } from "@/src/lib/db";
import { Review } from "@/src/lib/db/entities/Review";
import { apiError, apiOk } from "@/src/lib/http/response";

interface Params {
  id: string;
}

export async function POST(
  _req: NextRequest,
  context: { params: Promise<Params> }
) {
  const { id } = await context.params;

  if (!id) {
    return apiError("Review ID is required", { status: 400 });
  }

  const session = await getAppSession();

  try {
    const dataSource = await initializeDatabase();
    const reviewRepository = dataSource.getRepository(Review);

    const review = await reviewRepository.findOne({
      where: { id },
      select: ["userId"],
    });

    if (!review) {
      return apiError("리뷰를 찾을 수 없습니다.", { status: 404 });
    }

    if (session?.user?.id === review.userId) {
      return apiOk({ skipped: true });
    }

    await reviewRepository.increment({ id }, "views", 1);

    return apiOk({});
  } catch {
    return apiError("Failed to increment views", { status: 500 });
  }
}
