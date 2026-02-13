export interface iTunesAlbum {
  collectionId: number;
  collectionName: string;
  artistName: string;
  artworkUrl100: string;
  releaseDate: string;
  primaryGenreName: string;
  country?: string;
  collectionType?: string; // "Album", "EP", "Single" 등
  trackCount?: number;
}

export interface iTunesArtist {
  artistId: number;
  artistName: string;
  primaryGenreName?: string;
  artworkUrl100?: string;
}

export interface iTunesArtistLookupResult {
  artistId: number;
  artistName: string;
  primaryGenreName?: string;
  artworkUrl100?: string;
}

export interface iTunesSearchResponse {
  resultCount: number;
  results: iTunesAlbum[] | iTunesArtist[];
}

export interface iTunesLookupResponse {
  resultCount: number;
  results: iTunesAlbum[];
}

/**
 * artworkUrl100을 600x600 크기로 변환
 * 예: https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/.../100x100bb.jpg
 *  -> https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/.../600x600bb.jpg
 */
export function getLargeImageUrl(artworkUrl100: string | undefined): string | null {
  if (!artworkUrl100) return null;
  return artworkUrl100.replace(/100x100bb\.jpg$/, "600x600bb.jpg");
}

/**
 * 한글 검색어인지 확인
 */
function isKoreanSearch(term: string): boolean {
  return /[가-힣]/.test(term);
}

/**
 * 비공식/장난스러운 콘텐츠 필터링
 * @param album 앨범 정보
 * @returns true면 유효한 앨범, false면 필터링 대상
 */
function isValidAlbum(album: iTunesAlbum): boolean {
  const title = (album.collectionName || "").toUpperCase();
  const genre = (album.primaryGenreName || "").toUpperCase();

  // 제목 필터: 비공식 키워드, 싱글, 연주곡, 리마스터 에디션 제외
  const titleFilterKeywords = [
    "LEAK",
    "FANMADE",
    "TRIBUTE",
    "COVER",
    "PARODY",
    "BOOTLEG",
    "UNOFFICIAL",
    "FAN MADE",
    "FAN-MADE",
    "- SINGLE",
    " - SINGLE",
    "INSTRUMENTAL",
    "REMASTERED",
  ];

  for (const keyword of titleFilterKeywords) {
    if (title.includes(keyword)) {
      return false;
    }
  }

  // 장르 필터: Comedy 제외
  if (genre === "COMEDY") {
    return false;
  }

  return true;
}

/**
 * 메인 아티스트 이름 추출 (피처링 제외)
 * @param artistName 전체 아티스트 이름 (예: "Artist A & Artist B" 또는 "Artist A feat. Artist B")
 * @returns 메인 아티스트 이름
 */
function getMainArtist(artistName: string): string {
  // '&', 'feat', 'featuring', ',' 등으로 분리
  const separators = [/\s*&\s*/, /\s*feat\.?\s*/i, /\s*featuring\s*/i, /\s*,\s*/];
  
  for (const separator of separators) {
    if (separator.test(artistName)) {
      return artistName.split(separator)[0].trim();
    }
  }
  
  return artistName.trim();
}

/**
 * 피처링 앨범인지 확인 (메인 아티스트가 아닌 경우)
 * @param album 앨범 정보
 * @param searchTerm 검색어
 * @returns true면 피처링 앨범 (메인 아티스트가 아님)
 */
function isFeaturedAlbum(album: iTunesAlbum, searchTerm: string): boolean {
  const artistName = album.artistName || "";
  const termLower = searchTerm.toLowerCase().trim();
  
  // 아티스트 이름에 피처링 표시가 있는지 확인
  const hasFeatureMarker = /&|feat\.?|featuring|,/i.test(artistName);
  
  if (!hasFeatureMarker) {
    return false; // 피처링 표시가 없으면 메인 아티스트
  }
  
  // 메인 아티스트 추출
  const mainArtist = getMainArtist(artistName).toLowerCase();
  
  // 검색어가 메인 아티스트와 일치하는지 확인
  return mainArtist !== termLower && !mainArtist.includes(termLower);
}

/**
 * 검색어와 앨범의 관련성 확인 (더 유연한 검색)
 * @param album 앨범 정보
 * @param searchTerm 검색어
 * @returns true면 검색어와 관련이 있음, false면 관련 없음
 */
function isRelevantToSearch(album: iTunesAlbum, searchTerm: string): boolean {
  const termLower = searchTerm.toLowerCase().trim();
  const titleLower = (album.collectionName || "").toLowerCase();
  const artistLower = (album.artistName || "").toLowerCase();
  const mainArtistLower = getMainArtist(album.artistName || "").toLowerCase();

  // 메인 아티스트나 제목에 검색어가 포함되어 있으면 관련 있음
  if (mainArtistLower.includes(termLower) || titleLower.includes(termLower)) {
    return true;
  }

  // 전체 아티스트 이름에 검색어가 포함되어 있으면 관련 있음
  if (artistLower.includes(termLower)) {
    return true;
  }

  // 검색어를 단어 단위로 분리하여 확인
  const termWords = termLower.split(/\s+/).filter((w) => w.length > 1);
  if (termWords.length === 0) return true; // 검색어가 너무 짧으면 모두 포함

  // 검색어의 주요 단어가 아티스트 이름이나 제목에 포함되어 있는지 확인
  let matchedWords = 0;
  for (const word of termWords) {
    if (mainArtistLower.includes(word) || titleLower.includes(word)) {
      matchedWords++;
    }
  }

  // 검색어 단어의 절반 이상이 매칭되면 관련 있음
  return matchedWords >= Math.ceil(termWords.length / 2);
}

/**
 * 아티스트 이름과 검색어의 유사도 계산 (개선된 버전)
 * @param album 앨범 정보
 * @param searchTerm 검색어
 * @returns 유사도 점수 (높을수록 유사, 최대 1000)
 */
function calculateRelevanceScore(album: iTunesAlbum, searchTerm: string): number {
  const termLower = searchTerm.toLowerCase().trim();
  const artistLower = (album.artistName || "").toLowerCase();
  const mainArtistLower = getMainArtist(album.artistName || "").toLowerCase();
  const titleLower = (album.collectionName || "").toLowerCase();
  
  let score = 0;

  // 1. 메인 아티스트가 검색어와 정확히 일치 (최고 우선순위)
  if (mainArtistLower === termLower) {
    score += 1000;
  }
  // 2. 메인 아티스트가 검색어를 포함
  else if (mainArtistLower.includes(termLower)) {
    score += 800;
  }
  // 3. 검색어가 메인 아티스트를 포함
  else if (termLower.includes(mainArtistLower)) {
    score += 600;
  }
  // 4. 전체 아티스트 이름이 검색어와 정확히 일치
  else if (artistLower === termLower) {
    score += 500;
  }
  // 5. 전체 아티스트 이름이 검색어를 포함
  else if (artistLower.includes(termLower)) {
    score += 300;
  }
  // 6. 제목이 검색어를 포함
  else if (titleLower.includes(termLower)) {
    score += 200;
  }
  // 7. 단어 단위 매칭
  else {
    const termWords = termLower.split(/\s+/).filter((w) => w.length > 1);
    let matchedWords = 0;
    
    for (const word of termWords) {
      if (mainArtistLower.includes(word)) {
        matchedWords++;
      } else if (titleLower.includes(word)) {
        matchedWords += 0.5;
      }
    }
    
    score += matchedWords * 50;
  }

  // 피처링 앨범은 점수 감점 (하단으로 보내기)
  if (isFeaturedAlbum(album, searchTerm)) {
    score -= 500;
  }

  return score;
}

/**
 * 아티스트 이름과 검색어의 관련성 확인
 * @param artistName 아티스트 이름
 * @param searchTerm 검색어
 * @returns true면 검색어와 관련이 있음
 */
function isArtistRelevantToSearch(artistName: string, searchTerm: string): boolean {
  const termLower = searchTerm.toLowerCase().trim();
  const artistLower = artistName.toLowerCase();

  // 정확히 일치하거나 포함되면 관련 있음
  if (artistLower === termLower || artistLower.includes(termLower)) {
    return true;
  }

  // 검색어를 단어 단위로 분리하여 확인
  const termWords = termLower.split(/\s+/).filter((w) => w.length > 1);
  if (termWords.length === 0) return true; // 검색어가 너무 짧으면 모두 포함

  // 검색어의 모든 단어가 아티스트 이름에 포함되어 있는지 확인
  let matchedWords = 0;
  for (const word of termWords) {
    if (artistLower.includes(word)) {
      matchedWords++;
    }
  }

  // 검색어 단어의 절반 이상이 매칭되면 관련 있음
  return matchedWords >= Math.ceil(termWords.length / 2);
}

/**
 * 아티스트 ID로 프로필 이미지 조회
 * @param artistId 아티스트 ID
 * @returns 프로필 이미지 URL 또는 null
 */
async function getArtistProfileImage(artistId: number): Promise<string | null> {
  try {
    const url = `https://itunes.apple.com/lookup?id=${artistId}&entity=album&limit=1&country=KR&lang=ko_kr`;
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as iTunesLookupResponse;
    const albums = (data.results || []) as iTunesAlbum[];
    
    // 첫 번째 앨범의 artwork를 프로필 이미지로 사용
    if (albums.length > 0 && albums[0].artworkUrl100) {
      return getLargeImageUrl(albums[0].artworkUrl100);
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * iTunes Search API로 아티스트 검색
 * @param term 검색어
 * @param limit 결과 개수 제한
 */
export async function searchArtists(
  term: string,
  limit: number = 20
): Promise<iTunesArtist[]> {
  if (!term || term.trim().length === 0) {
    return [];
  }

  try {
    const trimmedTerm = term.trim();
    const encodedTerm = encodeURIComponent(trimmedTerm);
    const useKoreanParams = isKoreanSearch(trimmedTerm);
    // 1. 한국 스토어 검색
    const url = `https://itunes.apple.com/search?term=${encodedTerm}&media=music&entity=musicArtist&limit=${limit * 2}&country=KR&lang=ko_kr`;

    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      cache: "no-store", // 최근 발매 반영을 위해 캐시 무시
    });

    if (!response.ok) {
      throw new Error(`iTunes API error: ${response.status}`);
    }

    let data = (await response.json()) as iTunesSearchResponse;
    
    // 2. 한국 스토어 결과가 없으면 글로벌 검색 시도
    if (!data.results || data.results.length === 0) {
      const globalUrl = `https://itunes.apple.com/search?term=${encodedTerm}&media=music&entity=musicArtist&limit=${limit * 2}`;
      const globalResponse = await fetch(globalUrl, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      if (globalResponse.ok) {
        data = (await globalResponse.json()) as iTunesSearchResponse;
      }
    }

    let artists = (data.results || []) as iTunesArtist[];
    
    // 한글 검색어일 때는 필터링 완화 (iTunes API가 이미 관련 결과를 반환)
    // 영어 검색어일 때만 엄격한 필터링 적용
    let relevantArtists: iTunesArtist[];
    if (useKoreanParams) {
      // 한글 검색어: 기본 필터링만 (유효한 아티스트만)
      relevantArtists = artists.filter((artist) => {
        return artist.artistId && artist.artistName;
      });
      
      // 한글 검색 시 결과가 0개인 경우 이중 검색 로직 실행
      if (relevantArtists.length === 0) {
        try {
          // 한 번 더 동일 조건으로 시도 (안정성용)
          const fallbackUrl = `https://itunes.apple.com/search?term=${encodedTerm}&media=music&entity=musicArtist&limit=${limit * 2}&country=KR&lang=ko_kr`;
          const fallbackResponse = await fetch(fallbackUrl, {
            headers: {
              Accept: "application/json",
            },
          });
          
          if (fallbackResponse.ok) {
            const fallbackData = (await fallbackResponse.json()) as iTunesSearchResponse;
            const fallbackArtists = (fallbackData.results || []) as iTunesArtist[];
            // 검색어가 아티스트 이름에 포함되어 있는지 확인 (언어 무관)
            const matchedArtists = fallbackArtists.filter((artist) => {
              if (!artist.artistId || !artist.artistName) return false;
              const artistNameLower = artist.artistName.toLowerCase();
              const termLower = trimmedTerm.toLowerCase();
              // 검색어가 아티스트 이름에 포함되어 있으면 포함 (언어 무관)
              return artistNameLower.includes(termLower) || termLower.includes(artistNameLower);
            });
            
            if (matchedArtists.length > 0) {
              relevantArtists = matchedArtists;
              artists = matchedArtists;
            }
          }
        } catch {
        }
      }
    } else {
      // 영어 검색어: 관련성 필터링 적용
      relevantArtists = artists.filter((artist) => {
        if (!artist.artistId || !artist.artistName) return false;
        return isArtistRelevantToSearch(artist.artistName, trimmedTerm);
      });
    }
    
    // 중복 제거 및 관련성 점수 기반 정렬
    const uniqueArtists = new Map<number, iTunesArtist>();
    for (const artist of relevantArtists) {
      if (artist.artistId && !uniqueArtists.has(artist.artistId)) {
        uniqueArtists.set(artist.artistId, artist);
      }
    }

    // 관련성 점수 기반 정렬 (검색어 포함 결과를 최상단에 배치, 언어 무관)
    const sortedArtists = Array.from(uniqueArtists.values()).sort((a, b) => {
      const aName = a.artistName.toLowerCase();
      const bName = b.artistName.toLowerCase();
      const termLower = trimmedTerm.toLowerCase();
      const termHasKorean = /[가-힣]/.test(trimmedTerm);
      
      // 검색어가 아티스트 이름에 포함되어 있는지 확인 (언어 무관)
      const aContainsTerm = aName.includes(termLower) || termLower.includes(aName);
      const bContainsTerm = bName.includes(termLower) || termLower.includes(bName);
      
      // 검색어가 포함된 결과를 최상단에 배치 (언어 무관)
      if (aContainsTerm && !bContainsTerm) return -1;
      if (!aContainsTerm && bContainsTerm) return 1;
      
      // 둘 다 포함하거나 둘 다 포함하지 않을 때
      if (aContainsTerm && bContainsTerm) {
        // 정확히 일치하는 것 우선
        if (aName === termLower && bName !== termLower) return -1;
        if (bName === termLower && aName !== termLower) return 1;
      }

      // 한글 검색어일 때: 한글 아티스트 이름 우선
      if (termHasKorean) {
        const aHasKorean = /[가-힣]/.test(a.artistName);
        const bHasKorean = /[가-힣]/.test(b.artistName);
        
        if (aHasKorean && !bHasKorean) return -1;
        if (!aHasKorean && bHasKorean) return 1;
      }

      return 0;
    });

    // limit만큼만 반환
    const limitedArtists = sortedArtists.slice(0, limit);

    // 각 아티스트에 대해 실제로 유효한 앨범이 있는지 확인 (병렬 처리)
    // getArtistAlbums 함수를 사용하여 실제 앨범 페이지와 동일한 필터링 적용
    const artistsWithAlbums = await Promise.all(
      limitedArtists.map(async (artist) => {
        try {
          // getArtistAlbums 함수를 사용하여 실제 앨범 페이지와 동일한 필터링 적용
          // 이렇게 하면 앨범 페이지에서 "등록 가능한 앨범이 없습니다"가 표시되는 아티스트는
          // 검색 결과에서도 제외됨
          const validAlbums = await getArtistAlbums(artist.artistId, 50);

          // 유효한 앨범이 하나도 없으면 제외 (앨범 페이지에서도 표시되지 않음)
          if (!validAlbums || validAlbums.length === 0) {
            return null;
          }

          // 유효한 앨범이 있으면 포함
          // 프로필 이미지가 없으면 조회
          if (!artist.artworkUrl100) {
            const profileImage = await getArtistProfileImage(artist.artistId);
            if (profileImage) {
              return { ...artist, artworkUrl100: profileImage };
            }
          }

          return artist;
        } catch {
          // 에러 발생 시 제외 (작업물 확인 불가)
          return null;
        }
      })
    );

    // null 값 제거 (앨범이 없는 아티스트 필터링)
    const filteredArtists = artistsWithAlbums.filter((artist): artist is iTunesArtist => artist !== null);

    // 필터링 후 결과가 부족하면 추가로 확인
    if (filteredArtists.length < limit && sortedArtists.length > limit) {
      // 추가 아티스트 확인
      const additionalArtists = sortedArtists.slice(limit, limit * 2);
      const additionalArtistsWithAlbums = await Promise.all(
        additionalArtists.map(async (artist) => {
          try {
            // getArtistAlbums 함수를 사용하여 실제 앨범 페이지와 동일한 필터링 적용
            const validAlbums = await getArtistAlbums(artist.artistId, 50);

            // 유효한 앨범이 하나도 없으면 제외
            if (!validAlbums || validAlbums.length === 0) {
              return null;
            }

            // 유효한 앨범이 있으면 포함
            if (!artist.artworkUrl100) {
              const profileImage = await getArtistProfileImage(artist.artistId);
              if (profileImage) {
                return { ...artist, artworkUrl100: profileImage };
              }
            }
            return artist;
          } catch {
            // 에러 발생 시 제외
            return null;
          }
        })
      );

      const additionalFiltered = additionalArtistsWithAlbums.filter(
        (artist): artist is iTunesArtist => artist !== null
      );

      // 필요한 만큼만 추가
      const needed = limit - filteredArtists.length;
      filteredArtists.push(...additionalFiltered.slice(0, needed));
    }

    return filteredArtists;
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? `아티스트 검색 중 오류가 발생했습니다: ${error.message}`
        : "아티스트 검색 중 알 수 없는 오류가 발생했습니다."
    );
  }
}

/**
 * collectionId로 한국어 제목 조회
 * @param collectionId 앨범 collectionId
 * @returns 한국어 제목 또는 null
 */
async function getKoreanAlbumTitle(collectionId: number): Promise<string | null> {
  try {
    const url = `https://itunes.apple.com/lookup?id=${collectionId}&country=KR&lang=ko_kr`;
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as iTunesLookupResponse;
    const albums = (data.results || []) as iTunesAlbum[];
    
    if (albums.length > 0 && albums[0].collectionName) {
      const title = albums[0].collectionName;
      // 한글이 포함된 제목이면 반환
      if (/[가-힣]/.test(title)) {
        return title;
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * iTunes Lookup API로 아티스트의 앨범 목록 조회
 * @param artistId 아티스트 ID
 * @param limit 결과 개수 제한
 */
export async function getArtistAlbums(
  artistId: number,
  limit: number = 50
): Promise<iTunesAlbum[]> {
  try {
    // 1. 한국 스토어 조회
    const url = `https://itunes.apple.com/lookup?id=${artistId}&entity=album&limit=${limit}&country=KR&lang=ko_kr`;

    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      cache: "no-store", // 최근 발매 반영
    });

    if (!response.ok) {
      throw new Error(`iTunes API error: ${response.status}`);
    }

    let data = (await response.json()) as iTunesLookupResponse;
    let albums = (data.results || []) as iTunesAlbum[];

    // 2. 한국 스토어 결과가 부족하면(본인 제외 0개) 글로벌 조회 시도
    // lookup 결과의 첫 번째는 보통 아티스트 자신이므로 length가 1 이하면 앨범이 없는 것
    if (albums.length <= 1) {
      const globalUrl = `https://itunes.apple.com/lookup?id=${artistId}&entity=album&limit=${limit}`;
      const globalResponse = await fetch(globalUrl, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      if (globalResponse.ok) {
        data = (await globalResponse.json()) as iTunesLookupResponse;
        albums = (data.results || []) as iTunesAlbum[];
      }
    }

    // 싱글 제거 및 비공식 콘텐츠 필터링
    const filteredAlbums = albums.filter((album) => {
      const collectionType = album.collectionType?.toLowerCase() || "";
      const trackCount = album.trackCount || 0;
      
      // "Single"이더라도 트랙 수가 많으면(5곡 이상) 앨범으로 간주하여 포함
      if (collectionType === "single" && trackCount < 5) {
        return false;
      }
      // 비공식/장난스러운 콘텐츠 필터링
      return isValidAlbum(album);
    });

    // 중복 제거 (collectionId 기준 + collectionName + artistName 조합으로도 체크)
    const uniqueAlbums = new Map<number, iTunesAlbum>();
    const seenCombinations = new Set<string>();
    
    for (const album of filteredAlbums) {
      if (!album.collectionId) continue;
      
      // collectionId로 먼저 체크
      if (uniqueAlbums.has(album.collectionId)) {
        continue;
      }
      
      // collectionName + artistName 조합으로도 중복 체크 (대소문자 무시)
      const combination = `${(album.collectionName || "").toLowerCase().trim()}_${(album.artistName || "").toLowerCase().trim()}`;
      if (seenCombinations.has(combination)) {
        continue;
      }
      
      uniqueAlbums.set(album.collectionId, album);
      seenCombinations.add(combination);
    }

    const albumsList = Array.from(uniqueAlbums.values());

    // 모든 앨범에 대해 한국어 제목이 존재한다면 우선적으로 사용
    // country=KR&lang=ko_kr로 이미 조회했지만, 추가로 한국어 제목 확인
    const albumsWithKoreanTitles = await Promise.all(
      albumsList.map(async (album) => {
        // 이미 제목에 한글이 있으면 그대로 사용
        if (/[가-힣]/.test(album.collectionName)) {
          return album;
        }
        
        // 한글이 없으면 한국어 제목 조회 시도 (모든 앨범에 대해)
        const koreanTitle = await getKoreanAlbumTitle(album.collectionId);
        if (koreanTitle) {
          return { ...album, collectionName: koreanTitle };
        }
        
        return album;
      })
    );

    // 발매일 기준 내림차순 정렬 (최신순)
    return albumsWithKoreanTitles.sort((a, b) => {
      const dateA = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
      const dateB = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
      return dateB - dateA;
    });
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? `앨범 목록 조회 중 오류가 발생했습니다: ${error.message}`
        : "앨범 목록 조회 중 알 수 없는 오류가 발생했습니다."
    );
  }
}

/**
 * iTunes Search API로 앨범 검색 (단일 엔티티)
 */
async function searchAlbumsByEntity(
  term: string,
  entity: "album" | "musicTrack",
  limit: number,
  _useKoreanParams: boolean = false
): Promise<iTunesAlbum[]> {
  const encodedTerm = encodeURIComponent(term.trim());
  // 1. 한국 스토어 검색
  const url = `https://itunes.apple.com/search?term=${encodedTerm}&media=music&entity=${entity}&limit=${limit}&country=KR&lang=ko_kr`;

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    cache: "no-store", // 최근 발매 반영
  });

  if (!response.ok) {
    throw new Error(`iTunes API error: ${response.status}`);
  }

  let data = (await response.json()) as iTunesSearchResponse;
  
  // 2. 한국 스토어 결과가 없으면 글로벌 검색 시도
  if (!data.results || data.results.length === 0) {
    const globalUrl = `https://itunes.apple.com/search?term=${encodedTerm}&media=music&entity=${entity}&limit=${limit}`;
    const globalResponse = await fetch(globalUrl, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (globalResponse.ok) {
      data = (await globalResponse.json()) as iTunesSearchResponse;
    }
  }

  return (data.results || []) as iTunesAlbum[];
}

/**
 * iTunes Search API로 앨범 검색
 * - entity=album로 먼저 검색, 결과가 적으면 musicTrack도 시도
 * - 한글 검색 시 country=KR 파라미터 추가
 * - 싱글 제외 (EP와 정규 앨범만 포함)
 * - 메인 아티스트 우선 정렬, 피처링 앨범 하단 배치
 * @param term 검색어 (앨범명, 아티스트명 등)
 * @param limit 결과 개수 제한 (기본 20, 내부적으로 50개 검색 후 필터링)
 */
export async function searchAlbums(
  term: string,
  limit: number = 20
): Promise<iTunesAlbum[]> {
  if (!term || term.trim().length === 0) {
    return [];
  }

  try {
    const trimmedTerm = term.trim();
    const useKoreanParams = isKoreanSearch(trimmedTerm);
    
    // 내부적으로 더 많은 결과를 가져와서 필터링 (limit=100)
    const internalLimit = 100;
    
    // 1차: entity=album로 검색
    let allResults = await searchAlbumsByEntity(
      trimmedTerm,
      "album",
      internalLimit,
      useKoreanParams
    );

    // 싱글 제거, 비공식 콘텐츠 필터링, 검색어 관련성 필터링
    allResults = allResults.filter((album) => {
      const collectionType = album.collectionType?.toLowerCase() || "";
      const trackCount = album.trackCount || 0;

      // "Single"이더라도 트랙 수가 많으면(5곡 이상) 앨범으로 간주하여 포함
      if (collectionType === "single" && trackCount < 5) {
        return false;
      }
      // 비공식/장난스러운 콘텐츠 필터링
      if (!isValidAlbum(album)) {
        return false;
      }
      // 검색어와 관련성 확인 (더 유연한 검색)
      return isRelevantToSearch(album, trimmedTerm);
    });

    // 결과가 적으면 (10개 미만) musicTrack도 추가로 검색
    if (allResults.length < 10) {
      try {
        const trackResults = await searchAlbumsByEntity(
          trimmedTerm,
          "musicTrack",
          Math.min(internalLimit - allResults.length, 30),
          useKoreanParams
        );

        // musicTrack 결과에서 collectionId 추출하여 앨범 정보 수집
        const trackAlbums = trackResults.filter((track) => {
          const collectionType = track.collectionType?.toLowerCase() || "";
          const trackCount = track.trackCount || 0;

          if (!track.collectionId) {
            return false;
          }
          // "Single"이더라도 트랙 수가 많으면(5곡 이상) 앨범으로 간주하여 포함
          if (collectionType === "single" && trackCount < 5) {
            return false;
          }
          // 비공식/장난스러운 콘텐츠 필터링
          if (!isValidAlbum(track)) {
            return false;
          }
          // 검색어와 관련성 확인
          return isRelevantToSearch(track, trimmedTerm);
        });

        // 기존 결과와 병합 (중복 제거)
        const existingIds = new Set(allResults.map((a) => a.collectionId));
        for (const track of trackAlbums) {
          if (track.collectionId && !existingIds.has(track.collectionId)) {
            allResults.push(track);
            existingIds.add(track.collectionId);
          }
        }
      } catch {
        // musicTrack 검색 실패는 무시하고 album 결과만 반환
      }
    }

    // 최종 중복 제거 (collectionId 기준)
    const uniqueAlbums = new Map<number, iTunesAlbum>();
    for (const album of allResults) {
      if (album.collectionId && !uniqueAlbums.has(album.collectionId)) {
        uniqueAlbums.set(album.collectionId, album);
      }
    }

    let albumsList = Array.from(uniqueAlbums.values());

    // 한글 검색 시 결과가 0개인 경우 이중 검색 로직 실행
    if (useKoreanParams && albumsList.length === 0) {
      try {
        // entity=musicArtist로 검색해서 artistId 찾기
        const artistSearchUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(trimmedTerm)}&media=music&entity=musicArtist&limit=5&country=KR&lang=ko_kr`;
        const artistResponse = await fetch(artistSearchUrl, {
          headers: {
            Accept: "application/json",
          },
        });

        if (artistResponse.ok) {
          const artistData = (await artistResponse.json()) as iTunesSearchResponse;
          const artists = (artistData.results || []) as iTunesArtist[];

          // 검색어가 아티스트 이름에 포함되어 있는지 확인 (언어 무관)
          const matchedArtists = artists.filter((artist) => {
            if (!artist.artistId || !artist.artistName) return false;
            const artistNameLower = artist.artistName.toLowerCase();
            const termLower = trimmedTerm.toLowerCase();
            return artistNameLower.includes(termLower) || termLower.includes(artistNameLower);
          });

          // 매칭된 아티스트의 앨범 조회
          if (matchedArtists.length > 0) {
            const artistAlbumsPromises = matchedArtists.map((artist) =>
              getArtistAlbums(artist.artistId, 20)
            );
            const artistAlbumsArrays = await Promise.all(artistAlbumsPromises);
            albumsList = artistAlbumsArrays.flat();
          }
        }
      } catch {
      }
    }

    // 모든 앨범에 대해 한국어 제목이 존재한다면 우선적으로 사용
    const albumsWithKoreanTitles = await Promise.all(
      albumsList.map(async (album) => {
        // 이미 제목에 한글이 있으면 그대로 사용
        if (/[가-힣]/.test(album.collectionName)) {
          return album;
        }
        
        // 한글이 없으면 한국어 제목 조회 시도
        const koreanTitle = await getKoreanAlbumTitle(album.collectionId);
        if (koreanTitle) {
          return { ...album, collectionName: koreanTitle };
        }
        
        return album;
      })
    );

    // 검색어가 포함된 결과를 최상단에 배치 (언어 무관)
    const sortedAlbums = albumsWithKoreanTitles.sort((a, b) => {
      const termLower = trimmedTerm.toLowerCase();
      const aTitle = (a.collectionName || "").toLowerCase();
      const aArtist = (a.artistName || "").toLowerCase();
      const bTitle = (b.collectionName || "").toLowerCase();
      const bArtist = (b.artistName || "").toLowerCase();
      
      // 검색어가 제목이나 아티스트 이름에 포함되어 있는지 확인 (언어 무관)
      const aContainsTerm = aTitle.includes(termLower) || aArtist.includes(termLower) || 
                           termLower.includes(aTitle) || termLower.includes(aArtist);
      const bContainsTerm = bTitle.includes(termLower) || bArtist.includes(termLower) ||
                           termLower.includes(bTitle) || termLower.includes(bArtist);
      
      // 검색어가 포함된 결과를 최상단에 배치 (언어 무관)
      if (aContainsTerm && !bContainsTerm) return -1;
      if (!aContainsTerm && bContainsTerm) return 1;
      
      // 둘 다 포함하거나 둘 다 포함하지 않을 때는 관련성 점수로 정렬
      if (aContainsTerm && bContainsTerm) {
        const scoreA = calculateRelevanceScore(a, trimmedTerm);
        const scoreB = calculateRelevanceScore(b, trimmedTerm);
        return scoreB - scoreA;
      }
      
      // 검색어가 포함되지 않은 경우도 관련성 점수로 정렬
      const scoreA = calculateRelevanceScore(a, trimmedTerm);
      const scoreB = calculateRelevanceScore(b, trimmedTerm);
      return scoreB - scoreA;
    });

    // 최종 결과 반환 (요청한 limit만큼)
    return sortedAlbums.slice(0, limit);
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? `앨범 검색 중 오류가 발생했습니다: ${error.message}`
        : "앨범 검색 중 알 수 없는 오류가 발생했습니다."
    );
  }
}

