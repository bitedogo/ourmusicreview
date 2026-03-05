import { NextResponse } from "next/server";
import { initializeDatabase } from "@/src/lib/db";
import { Review } from "@/src/lib/db/entities/Review";
import { Album } from "@/src/lib/db/entities/Album";
import { getLargeImageUrl } from "@/src/lib/itunes";

async function fetchAlbumFromItunes(albumId: string): Promise<{
  albumId: string;
  title: string;
  artist: string;
  imageUrl: string | null;
} | null> {
  const idNum = parseInt(albumId, 10);
  if (!Number.isFinite(idNum)) return null;
  const url = `https://itunes.apple.com/lookup?id=${idNum}&entity=album&limit=1&country=KR`;
  const res = await fetch(url, { headers: { Accept: "application/json" }, next: { revalidate: 3600 } });
  if (!res.ok) return null;
  const data = (await res.json()) as { resultCount: number; results?: Array<{ collectionId: number; collectionName: string; artistName: string; artworkUrl100?: string }> };
  const first = data.results?.[0];
  if (!first || first.collectionId !== idNum) return null;
  return {
    albumId: String(first.collectionId),
    title: first.collectionName ?? "",
    artist: first.artistName ?? "",
    imageUrl: getLargeImageUrl(first.artworkUrl100) ?? null,
  };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ albumId: string }> }
) {
  try {
    const { albumId } = await params;

    if (!albumId) {
      return NextResponse.json(
        { ok: false, error: "앨범 ID가 필요합니다." },
        { status: 400 }
      );
    }

    const dataSource = await initializeDatabase();
    const reviewRepository = dataSource.getRepository(Review);
    const albumRepository = dataSource.getRepository(Album);

    const album = await albumRepository.findOne({
      where: { albumId },
    });

    if (!album) {
      const itunesAlbum = await fetchAlbumFromItunes(albumId);
      if (itunesAlbum) {
        return NextResponse.json({
          ok: true,
          album: itunesAlbum,
          reviews: [],
        });
      }
      return NextResponse.json(
        { ok: false, error: "앨범을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const reviews = await reviewRepository.find({
      where: { albumId, isApproved: "Y" },
      relations: ["user"],
      order: { createdAt: "DESC" },
    });

    return NextResponse.json({
      ok: true,
      album: {
        albumId: album.albumId,
        title: album.title,
        artist: album.artist,
        imageUrl: album.imageUrl,
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
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "리뷰 목록 조회 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
