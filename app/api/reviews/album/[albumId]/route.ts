/** GET 앨범별 리뷰 목록 */

import { initializeDatabase } from "@/src/lib/db";
import { Review } from "@/src/lib/db/entities/Review";
import { Album } from "@/src/lib/db/entities/Album";
import { getAlbumById } from "@/src/lib/album-lookup";
import { apiError, apiOk } from "@/src/lib/http/response";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ albumId: string }> }
) {
  try {
    const { albumId } = await params;

    if (!albumId) {
      return apiError("앨범 ID가 필요합니다.", { status: 400 });
    }

    const dataSource = await initializeDatabase();
    const reviewRepository = dataSource.getRepository(Review);
    const albumRepository = dataSource.getRepository(Album);

    const album = await albumRepository.findOne({
      where: { albumId },
    });

    const lookupAlbum = await getAlbumById(albumId);
    const albumForResponse = lookupAlbum
      ? {
          albumId: lookupAlbum.collectionId,
          artistId: lookupAlbum.artistId,
          title: lookupAlbum.title,
          artist: lookupAlbum.artist,
          imageUrl: lookupAlbum.imageUrl,
          genre: lookupAlbum.genre || null,
          releaseDate: lookupAlbum.releaseDate?.trim() || null,
        }
      : null;

    if (!album) {
      if (albumForResponse) {
        return apiOk({
          album: albumForResponse,
          reviews: [],
        });
      }
      return apiError("앨범을 찾을 수 없습니다.", { status: 404 });
    }

    const reviews = await reviewRepository.find({
      where: { albumId },
      relations: ["user"],
      order: { createdAt: "DESC" },
    });

    return apiOk({
      album: {
        albumId: album.albumId,
        artistId: albumForResponse?.artistId ?? null,
        title: album.title,
        artist: album.artist,
        imageUrl: album.imageUrl,
        genre: albumForResponse?.genre ?? null,
        releaseDate: albumForResponse?.releaseDate ?? null,
      },
      reviews: reviews.map((review) => ({
        id: review.id,
        content: review.content,
        rating: review.rating,
        isApproved: review.isApproved,
        userId: review.userId,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        user: {
          id: review.user.id,
          nickname: review.user.nickname,
          profileImage: review.user.profileImage,
        },
      })),
    });
  } catch (error) {
    return apiError(
      error instanceof Error ? error.message : "리뷰 목록 조회 중 오류가 발생했습니다.",
      { status: 500 }
    );
  }
}
