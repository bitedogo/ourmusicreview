import { initializeDatabase } from "@/src/lib/db";
import { Review } from "@/src/lib/db/entities/Review";
import { Album } from "@/src/lib/db/entities/Album";
import { getLargeImageUrl } from "@/src/lib/itunes";
import { apiError, apiOk } from "@/src/lib/http/response";

async function fetchAlbumFromItunes(albumId: string): Promise<{
  albumId: string;
  artistId: string | null;
  title: string;
  artist: string;
  imageUrl: string | null;
  genre: string | null;
} | null> {
  const idNum = parseInt(albumId, 10);
  if (!Number.isFinite(idNum)) return null;
  const url = `https://itunes.apple.com/lookup?id=${idNum}&entity=album&limit=1&country=KR`;
  const res = await fetch(url, { headers: { Accept: "application/json" }, next: { revalidate: 3600 } });
  if (!res.ok) return null;
  const data = (await res.json()) as {
    resultCount: number;
    results?: Array<{
      collectionId: number;
      artistId?: number;
      collectionName: string;
      artistName: string;
      artworkUrl100?: string;
      primaryGenreName?: string;
    }>;
  };
  const first = data.results?.[0];
  if (!first || first.collectionId !== idNum) return null;
  return {
    albumId: String(first.collectionId),
    artistId:
      typeof first.artistId === "number" && Number.isFinite(first.artistId)
        ? String(first.artistId)
        : null,
    title: first.collectionName ?? "",
    artist: first.artistName ?? "",
    imageUrl: getLargeImageUrl(first.artworkUrl100) ?? null,
    genre: first.primaryGenreName?.trim() || null,
  };
}

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

    const itunesAlbum = await fetchAlbumFromItunes(albumId);

    if (!album) {
      if (itunesAlbum) {
        return apiOk({
          album: itunesAlbum,
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
        artistId: itunesAlbum?.artistId ?? null,
        title: album.title,
        artist: album.artist,
        imageUrl: album.imageUrl,
        genre: itunesAlbum?.genre ?? null,
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
