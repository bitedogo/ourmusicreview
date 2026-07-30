/** 리뷰 상세 조회·작성·수정·삭제 비즈니스 로직 */

import type { DataSource } from "typeorm";
import { randomUUID } from "crypto";
import { Review } from "@/src/lib/db/entities/Review";
import { Album } from "@/src/lib/db/entities/Album";
import { getAlbumById } from "@/src/lib/album-lookup";
import { ServiceError } from "@/src/lib/http/service-error";

export interface ReviewRequester {
  userId: string;
  isAdmin: boolean;
}

export interface ReviewDetailResult {
  review: {
    id: string;
    content: string;
    rating: number;
    isApproved: "Y" | "N";
    rejectReason: string | null;
    userId: string;
    albumId: string;
    createdAt: Date;
    updatedAt: Date;
    user: {
      id: string;
      nickname: string;
      profileImage?: string | null;
    };
    album: {
      albumId: string;
      title: string;
      artist: string;
      artistId: string | null;
      imageUrl?: string | null;
      genre: string | null;
      releaseDate: string | null;
    };
  };
  nextReviewId: string | null;
}

export async function getReviewDetail(
  dataSource: DataSource,
  id: string
): Promise<ReviewDetailResult> {
  const reviewRepository = dataSource.getRepository(Review);

  const review = await reviewRepository.findOne({
    where: { id },
    relations: ["user", "album"],
  });

  if (!review) {
    throw new ServiceError("리뷰를 찾을 수 없습니다.", 404);
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

  return {
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
        artistId: albumInfo?.artistId ?? null,
        imageUrl: review.album.imageUrl,
        genre: albumInfo?.genre?.trim() || null,
        releaseDate: albumInfo?.releaseDate?.trim() || null,
      },
    },
    nextReviewId: nextOlder?.id ?? null,
  };
}

export interface UpdateReviewInput {
  content?: string;
  rating?: number;
}

export interface UpdateReviewResult {
  id: string;
  content: string;
  rating: number;
  updatedAt: Date;
}

export async function updateReview(
  dataSource: DataSource,
  id: string,
  requester: ReviewRequester,
  body: UpdateReviewInput
): Promise<UpdateReviewResult> {
  const content =
    typeof body.content === "string" ? body.content.trim() : undefined;
  let rating: number | undefined = undefined;
  if (typeof body.rating === "number" && !isNaN(body.rating)) {
    const rounded = Math.round(body.rating * 10) / 10;
    if (rounded >= 0 && rounded <= 10) {
      rating = rounded;
    }
  }

  const reviewRepository = dataSource.getRepository(Review);
  const review = await reviewRepository.findOne({ where: { id } });

  if (!review) {
    throw new ServiceError("리뷰를 찾을 수 없습니다.", 404);
  }

  if (review.userId !== requester.userId && !requester.isAdmin) {
    throw new ServiceError("수정 권한이 없습니다.", 403);
  }

  let hasUserEdit = false;

  if (content !== undefined) {
    if (!content || content === "<p><br></p>") {
      throw new ServiceError("리뷰 내용을 입력해주세요.", 400);
    }
    if (review.content !== content) {
      review.content = content;
      hasUserEdit = true;
    }
  }

  if (rating !== undefined && review.rating !== rating) {
    review.rating = rating;
    hasUserEdit = true;
  }

  if (!hasUserEdit) {
    throw new ServiceError("수정한 내용이 없습니다.", 400);
  }

  await reviewRepository.save(review);

  return {
    id: review.id,
    content: review.content,
    rating: review.rating,
    updatedAt: review.updatedAt,
  };
}

export async function deleteReview(
  dataSource: DataSource,
  id: string,
  requester: ReviewRequester
): Promise<void> {
  const reviewRepository = dataSource.getRepository(Review);
  const review = await reviewRepository.findOne({ where: { id } });

  if (!review) {
    throw new ServiceError("리뷰를 찾을 수 없습니다.", 404);
  }

  if (review.userId !== requester.userId && !requester.isAdmin) {
    throw new ServiceError("삭제 권한이 없습니다.", 403);
  }

  await reviewRepository.remove(review);
}

export interface CreateReviewInput {
  albumId?: string;
  content?: string;
  rating?: number;
  albumTitle?: string;
  albumArtist?: string;
  albumImageUrl?: string | null;
  albumReleaseDate?: string;
}

export async function createReview(
  dataSource: DataSource,
  userId: string,
  body: CreateReviewInput
): Promise<{ id: string }> {
  const albumId =
    typeof body.albumId === "string" ? body.albumId.trim() : undefined;
  const content =
    typeof body.content === "string" ? body.content.trim() : undefined;
  let rating: number | undefined = undefined;
  if (typeof body.rating === "number" && !isNaN(body.rating)) {
    const rounded = Math.round(body.rating * 10) / 10;
    if (rounded >= 0 && rounded <= 10) {
      rating = rounded;
    }
  }

  if (!albumId || !content) {
    throw new ServiceError("앨범 ID와 리뷰 내용은 필수입니다.", 400);
  }

  if (rating === undefined) {
    throw new ServiceError("평점(0.0-10.0)을 입력해주세요.", 400);
  }

  const albumRepository = dataSource.getRepository(Album);
  const reviewRepository = dataSource.getRepository(Review);

  const existingReview = await reviewRepository.findOne({
    where: {
      userId,
      albumId,
    },
    select: ["id"],
  });

  if (existingReview) {
    throw new ServiceError("동일한 앨범에는 리뷰를 1개만 작성할 수 있습니다.", 409);
  }

  let album = await albumRepository.findOne({
    where: { albumId },
  });

  if (!album) {
    const albumTitle =
      typeof body.albumTitle === "string" ? body.albumTitle.trim() : undefined;
    const albumArtist =
      typeof body.albumArtist === "string" ? body.albumArtist.trim() : undefined;
    const albumImageUrl =
      typeof body.albumImageUrl === "string" && body.albumImageUrl.length > 0
        ? body.albumImageUrl
        : null;

    if (!albumTitle || !albumArtist) {
      throw new ServiceError(
        "앨범 정보가 부족합니다. 앨범 제목과 아티스트는 필수입니다.",
        400
      );
    }

    let releaseDate: Date | undefined = undefined;
    if (body.albumReleaseDate) {
      const parsed = new Date(body.albumReleaseDate);
      if (!isNaN(parsed.getTime())) {
        releaseDate = parsed;
      }
    }

    const newAlbum = albumRepository.create({
      albumId,
      title: albumTitle,
      artist: albumArtist,
      imageUrl: albumImageUrl || undefined,
      releaseDate,
      category: "I",
    });

    await albumRepository.save(newAlbum);
    album = newAlbum;
  }

  const reviewId = randomUUID().replace(/-/g, "").slice(0, 255);

  const review = reviewRepository.create({
    id: reviewId,
    albumId,
    userId,
    content,
    rating,
    isApproved: "Y",
    rejectReason: null,
  });

  try {
    await reviewRepository.save(review);
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "23505"
    ) {
      throw new ServiceError("동일한 앨범에는 리뷰를 1개만 작성할 수 있습니다.", 409);
    }
    throw error;
  }

  return { id: review.id };
}

export interface UserReviewListItem {
  id: string;
  content: string;
  rating: number;
  isApproved: "Y" | "N";
  rejectReason: string | null;
  albumId: string;
  createdAt: Date;
  updatedAt: Date;
  album: {
    albumId: string;
    title: string;
    artist: string;
    imageUrl?: string | null;
  } | null;
}

export async function getUserReviews(
  dataSource: DataSource,
  userId: string
): Promise<UserReviewListItem[]> {
  const reviewRepository = dataSource.getRepository(Review);

  const reviews = await reviewRepository.find({
    where: { userId },
    relations: ["album"],
    order: { createdAt: "DESC" },
  });

  return reviews.map((review) => ({
    id: review.id,
    content: review.content,
    rating: review.rating,
    isApproved: review.isApproved,
    rejectReason: review.rejectReason,
    albumId: review.albumId,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
    album: review.album
      ? {
          albumId: review.album.albumId,
          title: review.album.title,
          artist: review.album.artist,
          imageUrl: review.album.imageUrl,
        }
      : null,
  }));
}
