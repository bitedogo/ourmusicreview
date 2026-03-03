import { NextResponse } from "next/server";
import { getArtistAlbums, getLargeImageUrl } from "@/src/lib/itunes";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ artistId: string }> }
) {
  try {
    const { artistId } = await params;
    const artistIdNum = parseInt(artistId, 10);

    if (isNaN(artistIdNum)) {
      return NextResponse.json(
        { ok: false, error: "유효하지 않은 아티스트 ID입니다." },
        { status: 400 }
      );
    }

    const itunesResults = await getArtistAlbums(artistIdNum, 50);

    const albums = itunesResults.map((album) => ({
      collectionId: album.collectionId,
      collectionName: album.collectionName,
      artistName: album.artistName,
      artworkUrl100: album.artworkUrl100,
      releaseDate: album.releaseDate,
      primaryGenreName: album.primaryGenreName,
      imageUrl600: getLargeImageUrl(album.artworkUrl100),
    }));

    return NextResponse.json({ ok: true, albums }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "앨범 목록 조회 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
