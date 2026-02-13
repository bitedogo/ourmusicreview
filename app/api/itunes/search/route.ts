import { NextResponse } from "next/server";
import { searchAlbums, getLargeImageUrl } from "@/src/lib/itunes";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const term = searchParams.get("term");

    if (!term || term.trim().length === 0) {
      return NextResponse.json(
        { ok: false, error: "검색어를 입력해주세요." },
        { status: 400 }
      );
    }

    const itunesResults = await searchAlbums(term, 20);

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
            : "앨범 검색 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
