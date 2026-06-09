import { NextRequest, NextResponse } from "next/server";
import { MusicInfo, ItunesSearchResponse } from "@/src/lib/itunes/types"; // MusicInfo 임포트 경로 변경
import { ItunesTrack } from "@/src/lib/itunes/types";

interface Params {
  albumId: string;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<Params> }
) {
  try {
    const { albumId } = await context.params;

    console.log(`[API/iTunes Album Details] Received albumId: ${albumId}`);

    // iTunes API 호출 (albumId로 앨범 상세 정보 및 트랙 리스트를 가져옴)
    const itunesApiUrl = `https://itunes.apple.com/lookup?id=${encodeURIComponent(albumId)}&entity=song,album,artist&country=KR`; // artist 엔티티 추가
    const itunesResponse = await fetch(itunesApiUrl, { next: { revalidate: 3600 } });

    if (!itunesResponse.ok) {
      console.error(`[API/iTunes Album Details] iTunes API request failed with status: ${itunesResponse.status}`);
      return NextResponse.json({ message: "iTunes API 요청 실패" }, { status: 502 });
    }

    const itunesData: ItunesSearchResponse = await itunesResponse.json();

    const albumInfo = itunesData.results.find(item => item.wrapperType === 'collection' && item.collectionType === 'Album');
    const trackResults = itunesData.results.filter(item => item.wrapperType === 'track' && item.kind === 'song');
    const artistInfo = itunesData.results.find(item => item.wrapperType === 'artist'); // 아티스트 정보 찾기

    if (!albumInfo) {
      return NextResponse.json({ message: "앨범 정보를 찾을 수 없습니다." }, { status: 404 });
    }

    const tracks = trackResults.map((track: ItunesTrack) => ({
      id: track.trackId.toString(),
      title: track.trackName,
      duration: Math.floor(track.trackTimeMillis / 1000),
    }));

    const itunesArtistImage = ""; // 아티스트 이미지 사용 안함 // 아티스트 이미지

    const result: MusicInfo = {
      trackId: albumInfo.collectionId.toString(),
      trackName: albumInfo.collectionName,
      artistId: albumInfo.artistId,
      artistName: albumInfo.artistName,
      artistImage: "", // 아티스트 이미지 사용 안함
      albumName: albumInfo.collectionName,
      albumImage: albumInfo.artworkUrl100?.replace('100x100bb', '600x600bb') || albumInfo.artworkUrl600, // iTunes 고화질 앨범 아트
      duration: tracks.reduce((acc, curr) => acc + curr.duration, 0), // 모든 트랙의 재생 시간 합산
      releaseDate: albumInfo.releaseDate,
      tracks: tracks,
      primaryGenreName: albumInfo.primaryGenreName, // primaryGenreName 추가
    };

    return NextResponse.json({ ok: true, result });
  } catch (error) {
    console.error("iTunes 앨범 상세 정보 검색 실패:", error);
    return NextResponse.json({ message: "iTunes 앨범 상세 정보 검색 실패" }, { status: 500 });
  }
}