/** PATCH/GET 프로필 공개 설정 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth/config";
import { initializeDatabase } from "@/src/lib/db";
import { User } from "@/src/lib/db/entities/User";
import { apiError, apiOk } from "@/src/lib/http/response";

type PrivacyField =
  | "showReviewsPublic"
  | "showFavoritesPublic"
  | "showMasterpiecesPublic"
  | "showRatingPublic";

interface PrivacyBody {
  showReviewsPublic?: boolean;
  showFavoritesPublic?: boolean;
  showMasterpiecesPublic?: boolean;
  showRatingPublic?: boolean;
}

function toYn(value: boolean | undefined): "Y" | "N" | undefined {
  if (value === undefined) return undefined;
  return value ? "Y" : "N";
}

function toPrivacyResponse(user: User) {
  return {
    showReviewsPublic: user.showReviewsPublic !== "N",
    showFavoritesPublic: user.showFavoritesPublic !== "N",
    showMasterpiecesPublic: user.showMasterpiecesPublic !== "N",
    showRatingPublic: user.showRatingPublic !== "N",
  };
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return apiError("로그인이 필요합니다.", { status: 401 });
    }

    const body = (await request.json()) as PrivacyBody;
    const updates: Partial<Pick<User, PrivacyField>> = {};

    const reviews = toYn(body.showReviewsPublic);
    const favorites = toYn(body.showFavoritesPublic);
    const masterpieces = toYn(body.showMasterpiecesPublic);
    const rating = toYn(body.showRatingPublic);

    if (reviews !== undefined) updates.showReviewsPublic = reviews;
    if (favorites !== undefined) updates.showFavoritesPublic = favorites;
    if (masterpieces !== undefined) updates.showMasterpiecesPublic = masterpieces;
    if (rating !== undefined) updates.showRatingPublic = rating;

    if (Object.keys(updates).length === 0) {
      return apiError("변경할 공개 설정이 없습니다.", { status: 400 });
    }

    const dataSource = await initializeDatabase();
    const userRepository = dataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: session.user.id } });

    if (!user) {
      return apiError("사용자를 찾을 수 없습니다.", { status: 404 });
    }

    Object.assign(user, updates);
    await userRepository.save(user);

    return apiOk({
      privacy: toPrivacyResponse(user),
    });
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "공개 설정 저장 중 오류가 발생했습니다.",
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return apiError("로그인이 필요합니다.", { status: 401 });
    }

    const dataSource = await initializeDatabase();
    const userRepository = dataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: session.user.id },
      select: [
        "showReviewsPublic",
        "showFavoritesPublic",
        "showMasterpiecesPublic",
        "showRatingPublic",
      ],
    });

    if (!user) {
      return apiError("사용자를 찾을 수 없습니다.", { status: 404 });
    }

    return apiOk({
      privacy: toPrivacyResponse(user),
    });
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "공개 설정 조회 중 오류가 발생했습니다.",
      { status: 500 },
    );
  }
}
