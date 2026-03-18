import { initializeDatabase } from "@/src/lib/db";
import { Review } from "@/src/lib/db/entities/Review";
import { Album } from "@/src/lib/db/entities/Album";
import { getAlbumByCollectionId } from "@/src/lib/itunes";
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

    const idNum = parseInt(albumId, 10);
    const itunesAlbum =
      Number.isFinite(idNum) ? await getAlbumByCollectionId(idNum) : null;
    const albumForResponse = itunesAlbum
      ? {
          albumId: String(itunesAlbum.collectionId),
          artistId: itunesAlbum.artistId,
          title: itunesAlbum.title,
          artist: itunesAlbum.artist,
          imageUrl: itunesAlbum.imageUrl,
          genre: itunesAlbum.genre || null,
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
      where: { albumId, isApproved: "Y" },
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
