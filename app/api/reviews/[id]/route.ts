/** GET/PATCH/DELETE 리뷰 상세·수정·삭제 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth/config";
import { initializeDatabase } from "@/src/lib/db";
import { Review } from "@/src/lib/db/entities/Review";
import { getAlbumById } from "@/src/lib/album-lookup";
import { apiError, apiOk } from "@/src/lib/http/response";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return apiError("리뷰 ID가 필요합니다.", { status: 400 });
    }

    const dataSource = await initializeDatabase();
    const reviewRepository = dataSource.getRepository(Review);

    const review = await reviewRepository.findOne({
      where: { id },
      relations: ["user", "album"],
    });

    if (!review) {
      return apiError("리뷰를 찾을 수 없습니다.", { status: 404 });
    }

    const albumInfo = await getAlbumById(review.album.albumId);

    // 전체 승인 리뷰 중 현재보다 오래된(다음) 리뷰 — 최오래된 리뷰면 null
    const nextOlder = await reviewRepository
      .createQueryBuilder("r")
      .select(["r.id"])
      .where("r.isApproved = :approved", { approved: "Y" })
      .andWhere("r.id != :id", { id: review.id })
      .andWhere("r.createdAt < :createdAt", { createdAt: review.createdAt })
      .orderBy("r.createdAt", "DESC")
      .addOrderBy("r.id", "DESC")
      .getOne();

    return apiOk({
      review: {
        id: review.id,
        content: review.content,
        rating: review.rating,
        isApproved: review.isApproved,
        rejectReason: review.rejectReason,
        userId: review.userId,
        albumId: review.albumId,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        user: {
          id: review.user.id,
          nickname: review.user.nickname,
          profileImage: review.user.profileImage,
        },
        album: {
          albumId: review.album.albumId,
          title: review.album.title,
          artist: review.album.artist,
          imageUrl: review.album.imageUrl,
          genre: albumInfo?.genre?.trim() || null,
          releaseDate: albumInfo?.releaseDate?.trim() || null,
        },
      },
      nextReviewId: nextOlder?.id ?? null,
    });
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "리뷰 조회 중 오류가 발생했습니다.",
      { status: 500 }
    );
  }
}

interface UpdateReviewBody {
  content?: string;
  rating?: number;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return apiError("로그인이 필요합니다.", { status: 401 });
    }

    const body = (await request.json()) as UpdateReviewBody;
    const content =
      typeof body.content === "string" ? body.content.trim() : undefined;
    let rating: number | undefined = undefined;
    if (typeof body.rating === "number" && !isNaN(body.rating)) {
      const rounded = Math.round(body.rating * 10) / 10;
      if (rounded >= 0 && rounded <= 10) {
        rating = rounded;
      }
    }

    const dataSource = await initializeDatabase();
    const reviewRepository = dataSource.getRepository(Review);

    const review = await reviewRepository.findOne({
      where: { id },
    });

    if (!review) {
      return apiError("리뷰를 찾을 수 없습니다.", { status: 404 });
    }

    if (review.userId !== session.user.id && session.user.role !== "ADMIN") {
      return apiError("수정 권한이 없습니다.", { status: 403 });
    }

    let hasUserEdit = false;
    let contentChanged = false;

    if (content !== undefined) {
      if (!content || content === "<p><br></p>") {
        return apiError("리뷰 내용을 입력해주세요.", { status: 400 });
      }
      contentChanged = review.content !== content;
      if (contentChanged) {
        review.content = content;
        hasUserEdit = true;
      }
    }

    if (rating !== undefined && review.rating !== rating) {
      review.rating = rating;
      hasUserEdit = true;
    }

    if (!hasUserEdit) {
      return apiError("수정한 내용이 없습니다.", { status: 400 });
    }

    await reviewRepository.save(review);

    return apiOk({
      review: {
        id: review.id,
        content: review.content,
        rating: review.rating,
        updatedAt: review.updatedAt,
      },
    });
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "리뷰 수정 중 오류가 발생했습니다.",
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return apiError("로그인이 필요합니다.", { status: 401 });
    }

    const dataSource = await initializeDatabase();
    const reviewRepository = dataSource.getRepository(Review);

    const review = await reviewRepository.findOne({
      where: { id },
    });

    if (!review) {
      return apiError("리뷰를 찾을 수 없습니다.", { status: 404 });
    }

    if (review.userId !== session.user.id && session.user.role !== "ADMIN") {
      return apiError("삭제 권한이 없습니다.", { status: 403 });
    }

    await reviewRepository.remove(review);

    return apiOk({});
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "리뷰 삭제 중 오류가 발생했습니다.",
      { status: 500 }
    );
  }
}
