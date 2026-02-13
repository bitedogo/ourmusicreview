import { NextResponse } from "next/server";

interface iTunesTrack {
  wrapperType: string;
  kind?: string;
  trackId: number;
  trackName: string;
  trackNumber: number;
  trackTimeMillis: number;
  previewUrl?: string;
  collectionId?: number;
  collectionName?: string;
  artistName?: string;
  discNumber?: number;
}

interface iTunesAlbumDetail {
  wrapperType: string;
  collectionType: string;
  collectionId: number;
  collectionName: string;
  artistId: number;
  artistName: string;
  artworkUrl100: string;
  releaseDate: string;
  primaryGenreName?: string;
  trackCount?: number;
  copyright?: string;
}

interface iTunesLookupResponse {
  resultCount: number;
  results: (iTunesAlbumDetail | iTunesTrack)[];
}

// 앨범 제목 정규화 (매칭용)
function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/\(.*\)/g, "")
    .replace(/\[.*\]/g, "")
    .replace(/remastered|remaster|deluxe|edition|anniversary|special/g, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

// 제목 유사도 점수 계산 (특정 에디션 매칭용)
function calculateTitleMatchScore(trackAlbumName: string, targetAlbumName: string): number {
  const t1 = trackAlbumName.toLowerCase();
  const t2 = targetAlbumName.toLowerCase();
  
  if (t1 === t2) return 100; // 완전 일치
  
  let score = 0;
  // 특정 키워드(Anniversary, Deluxe 등)가 둘 다 있거나 둘 다 없어야 점수 높음
  const keywords = ["anniversary", "deluxe", "remaster", "edition", "live"];
  keywords.forEach(kw => {
    if (t1.includes(kw) === t2.includes(kw)) score += 10;
  });
  
  return score;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ collectionId: string }> }
) {
  try {
    const { collectionId } = await params;
    const collIdNum = parseInt(collectionId);
    
    if (!collectionId) {
      return NextResponse.json({ ok: false, error: "앨범 ID가 필요합니다." }, { status: 400 });
    }

    // 1차 시도: 한국 스토어 조회
    let url = `https://itunes.apple.com/lookup?id=${collectionId}&entity=song,album&limit=200&country=KR`;
    const response = await fetch(url, { headers: { Accept: "application/json" }, next: { revalidate: 3600 } });
    const data = (await response.json()) as iTunesLookupResponse;
    let results = data.results || [];

    let albumInfo = results.find(item => item.wrapperType === "collection") as iTunesAlbumDetail;
    let rawTracks = results.filter(item => item.wrapperType === "track") as iTunesTrack[];

    // 2차 시도 (Fallback): 글로벌 스토어
    if (rawTracks.length === 0) {
      url = `https://itunes.apple.com/lookup?id=${collectionId}&entity=song,album&limit=200`;
      const fallbackResponse = await fetch(url, { headers: { Accept: "application/json" } });
      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        if (fallbackData.results && fallbackData.results.length > 1) {
          results = fallbackData.results;
          albumInfo = results.find(item => item.wrapperType === "collection") as iTunesAlbumDetail || albumInfo;
          rawTracks = results.filter(item => item.wrapperType === "track") as iTunesTrack[];
        }
      }
    }

    // 3차 시도 (제목 기반 유연한 매칭): 여전히 곡이 없거나 부족할 때 아티스트 ID로 추적
    if (rawTracks.length < (albumInfo?.trackCount || 1) && albumInfo?.artistId) {
      const targetTitle = normalizeTitle(albumInfo.collectionName);
      const originalTargetName = albumInfo.collectionName;
      
      url = `https://itunes.apple.com/lookup?id=${albumInfo.artistId}&entity=song&limit=200`;
      const artistResponse = await fetch(url, { headers: { Accept: "application/json" } });
      
      if (artistResponse.ok) {
        const artistData = await artistResponse.json();
        const allArtistItems = artistData.results || [];

        const pooledTracks = allArtistItems.filter((item: { wrapperType?: string; collectionId?: number; collectionName?: string }) => {
          if (item.wrapperType !== "track") return false;
          if (item.collectionId === collIdNum) return true;
          
          const trackCollName = item.collectionName || "";
          const normalizedTrackCollName = normalizeTitle(trackCollName);
          
          return normalizedTrackCollName === targetTitle || 
                 normalizedTrackCollName.includes(targetTitle) || 
                 targetTitle.includes(normalizedTrackCollName);
        }) as iTunesTrack[];

        // [중복 제거 로직] 트랙 번호별로 가장 적합한 곡 하나만 선정
        const trackGroups = new Map<number, iTunesTrack>();
        
        pooledTracks.forEach(track => {
          const num = track.trackNumber;
          const currentBest = trackGroups.get(num);
          
          if (!currentBest) {
            trackGroups.set(num, track);
          } else {
            // 현재 보고 있는 앨범 제목과 더 유사한 에디션을 선택
            const currentScore = calculateTitleMatchScore(currentBest.collectionName || "", originalTargetName);
            const newScore = calculateTitleMatchScore(track.collectionName || "", originalTargetName);
            
            if (newScore > currentScore) {
              trackGroups.set(num, track);
            }
          }
        });

        rawTracks = Array.from(trackGroups.values());
      }
    }

    if (results.length === 0 || !albumInfo) {
      return NextResponse.json({ ok: false, error: "앨범 정보를 찾을 수 없습니다." }, { status: 404 });
    }

    // 최종 정렬 및 매핑
    return NextResponse.json(
      {
        ok: true,
        album: {
          collectionId: albumInfo.collectionId,
          collectionName: albumInfo.collectionName || "Unknown Album",
          artistName: albumInfo.artistName || "Unknown Artist",
          artworkUrl100: albumInfo.artworkUrl100,
          releaseDate: albumInfo.releaseDate,
          primaryGenreName: albumInfo.primaryGenreName || "",
          trackCount: albumInfo.trackCount || rawTracks.length || 0,
          copyright: albumInfo.copyright || "",
        },
        tracks: rawTracks
          .filter((track) => track.trackName)
          // 중복 제거 후에는 디스크 구분 없이 트랙 번호 순으로만 정렬하여 7번 등이 섞이지 않게 함
          .sort((a, b) => a.trackNumber - b.trackNumber)
          .map((track) => ({
            trackId: track.trackId,
            trackName: track.trackName,
            trackNumber: track.trackNumber, // 실제 API의 트랙 번호 사용
            trackTimeMillis: track.trackTimeMillis,
            previewUrl: track.previewUrl || null,
          })),
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ ok: false, error: "앨범 상세 정보 조회 오류" }, { status: 500 });
  }
}
