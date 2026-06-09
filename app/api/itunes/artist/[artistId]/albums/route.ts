import { NextRequest, NextResponse } from "next/server";
import { MusicInfo, ItunesSearchResponse } from "@/src/lib/itunes/types"; // MusicInfo 임포트 경로 변경

interface Params {
  artistId: string;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<Params> }
) {
  try {
    const { artistId } = await context.params;
    const { searchParams } = new URL(request.url);
    const artistNameFromQuery = searchParams.get("artistName") ?? "";

    console.log(`[API/iTunes Artist Albums] Received artistId: ${artistId}, artistName: ${artistNameFromQuery}`);

    // iTunes API 호출 (artistId로 아티스트의 모든 앨범을 가져옴)
    const itunesApiUrl = `https://itunes.apple.com/lookup?id=${encodeURIComponent(artistId)}&entity=album&country=KR`;
    const itunesResponse = await fetch(itunesApiUrl, { next: { revalidate: 3600 } });

    if (!itunesResponse.ok) {
      console.error(`[API/iTunes Artist Albums] iTunes API request failed with status: ${itunesResponse.status}`);
      return NextResponse.json({ message: "iTunes API 요청 실패" }, { status: 502 });
    }

    const itunesData: ItunesSearchResponse = await itunesResponse.json();

    // 첫 번째 결과는 아티스트 정보일 수 있으므로 앨범만 필터링
    const albumResults = itunesData.results.filter(item => item.wrapperType === 'collection' && item.collectionType === 'Album');

    // 아티스트 정보를 찾아서 이미지 URL을 가져옵니다.
    const artistInfo = itunesData.results.find(item => item.wrapperType === 'artist');
    const itunesArtistImage = ""; // 아티스트 이미지 사용 안함


    const results: MusicInfo[] = albumResults.map((album: any) => ({
      trackId: album.collectionId.toString(), // collectionId를 trackId로 사용
      trackName: album.collectionName, // 앨범 이름을 trackName으로 사용
      artistId: album.artistId,
      artistName: album.artistName,
      artistImage: "", // 아티스트 이미지 사용 안함
      albumName: album.collectionName,
      albumImage: album.artworkUrl100?.replace('100x100bb', '600x600bb') || album.artworkUrl600, // iTunes 고화질 앨범 아트
      duration: 0, // 앨범 정보에서는 트랙 duration을 알 수 없으므로 0으로 설정
      releaseDate: album.releaseDate, // 발매일 추가
      primaryGenreName: album.primaryGenreName, // primaryGenreName 추가
    }));

    return NextResponse.json({ ok: true, results });
  } catch (error) {
    console.error("iTunes 아티스트 앨범 검색 실패:", error);
    return NextResponse.json({ message: "iTunes 아티스트 앨범 검색 실패" }, { status: 500 });
  }
}