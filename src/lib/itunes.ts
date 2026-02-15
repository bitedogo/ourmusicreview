export interface iTunesAlbum {
  collectionId: number;
  collectionName: string;
  artistName: string;
  artworkUrl100: string;
  releaseDate: string;
  primaryGenreName: string;
  country?: string;
  collectionType?: string;
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
  
  const hasFeatureMarker = /&|feat\.?|featuring|,/i.test(artistName);
  
  if (!hasFeatureMarker) {
    return false;
  }
  
  const mainArtist = getMainArtist(artistName).toLowerCase();
  
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

  if (mainArtistLower.includes(termLower) || titleLower.includes(termLower)) {
    return true;
  }

  if (artistLower.includes(termLower)) {
    return true;
  }

  const termWords = termLower.split(/\s+/).filter((w) => w.length > 1);
  if (termWords.length === 0) return true;

  let matchedWords = 0;
  for (const word of termWords) {
    if (mainArtistLower.includes(word) || titleLower.includes(word)) {
      matchedWords++;
    }
  }

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

  if (mainArtistLower === termLower) {
    score += 1000;
  }
  else if (mainArtistLower.includes(termLower)) {
    score += 800;
  }
  else if (termLower.includes(mainArtistLower)) {
    score += 600;
  }
  else if (artistLower === termLower) {
    score += 500;
  }
  else if (artistLower.includes(termLower)) {
    score += 300;
  }
  else if (titleLower.includes(termLower)) {
    score += 200;
  }
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

  if (artistLower === termLower || artistLower.includes(termLower)) {
    return true;
  }

  const termWords = termLower.split(/\s+/).filter((w) => w.length > 1);
  if (termWords.length === 0) return true;

  let matchedWords = 0;
  for (const word of termWords) {
    if (artistLower.includes(word)) {
      matchedWords++;
    }
  }

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
    const url = `https://itunes.apple.com/search?term=${encodedTerm}&media=music&entity=musicArtist&limit=${limit * 2}&country=KR&lang=ko_kr`;

    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`iTunes API error: ${response.status}`);
    }

    let data = (await response.json()) as iTunesSearchResponse;
    
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
    
    let relevantArtists: iTunesArtist[];
    if (useKoreanParams) {
      relevantArtists = artists.filter((artist) => {
        return artist.artistId && artist.artistName;
      });
      
      if (relevantArtists.length === 0) {
        try {
          const fallbackUrl = `https://itunes.apple.com/search?term=${encodedTerm}&media=music&entity=musicArtist&limit=${limit * 2}&country=KR&lang=ko_kr`;
          const fallbackResponse = await fetch(fallbackUrl, {
            headers: {
              Accept: "application/json",
            },
          });
          
          if (fallbackResponse.ok) {
            const fallbackData = (await fallbackResponse.json()) as iTunesSearchResponse;
            const fallbackArtists = (fallbackData.results || []) as iTunesArtist[];
            const matchedArtists = fallbackArtists.filter((artist) => {
              if (!artist.artistId || !artist.artistName) return false;
              const artistNameLower = artist.artistName.toLowerCase();
              const termLower = trimmedTerm.toLowerCase();
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
      relevantArtists = artists.filter((artist) => {
        if (!artist.artistId || !artist.artistName) return false;
        return isArtistRelevantToSearch(artist.artistName, trimmedTerm);
      });
    }
    
    const uniqueArtists = new Map<number, iTunesArtist>();
    for (const artist of relevantArtists) {
      if (artist.artistId && !uniqueArtists.has(artist.artistId)) {
        uniqueArtists.set(artist.artistId, artist);
      }
    }

    const sortedArtists = Array.from(uniqueArtists.values()).sort((a, b) => {
      const aName = a.artistName.toLowerCase();
      const bName = b.artistName.toLowerCase();
      const termLower = trimmedTerm.toLowerCase();
      const termHasKorean = /[가-힣]/.test(trimmedTerm);
      
      const aContainsTerm = aName.includes(termLower) || termLower.includes(aName);
      const bContainsTerm = bName.includes(termLower) || termLower.includes(bName);
      
      if (aContainsTerm && !bContainsTerm) return -1;
      if (!aContainsTerm && bContainsTerm) return 1;
      
      if (aContainsTerm && bContainsTerm) {
        if (aName === termLower && bName !== termLower) return -1;
        if (bName === termLower && aName !== termLower) return 1;
      }

      if (termHasKorean) {
        const aHasKorean = /[가-힣]/.test(a.artistName);
        const bHasKorean = /[가-힣]/.test(b.artistName);
        
        if (aHasKorean && !bHasKorean) return -1;
        if (!aHasKorean && bHasKorean) return 1;
      }

      return 0;
    });

    const limitedArtists = sortedArtists.slice(0, limit);

    const artistsWithAlbums = await Promise.all(
      limitedArtists.map(async (artist) => {
        try {
          const validAlbums = await getArtistAlbums(artist.artistId, 50);

          if (!validAlbums || validAlbums.length === 0) {
            return null;
          }

          if (!artist.artworkUrl100) {
            const profileImage = await getArtistProfileImage(artist.artistId);
            if (profileImage) {
              return { ...artist, artworkUrl100: profileImage };
            }
          }

          return artist;
        } catch {
          return null;
        }
      })
    );

    const filteredArtists = artistsWithAlbums.filter((artist): artist is iTunesArtist => artist !== null);

    if (filteredArtists.length < limit && sortedArtists.length > limit) {
      const additionalArtists = sortedArtists.slice(limit, limit * 2);
      const additionalArtistsWithAlbums = await Promise.all(
        additionalArtists.map(async (artist) => {
          try {
            const validAlbums = await getArtistAlbums(artist.artistId, 50);

            if (!validAlbums || validAlbums.length === 0) {
              return null;
            }

            if (!artist.artworkUrl100) {
              const profileImage = await getArtistProfileImage(artist.artistId);
              if (profileImage) {
                return { ...artist, artworkUrl100: profileImage };
              }
            }
            return artist;
          } catch {
            return null;
          }
        })
      );

      const additionalFiltered = additionalArtistsWithAlbums.filter(
        (artist): artist is iTunesArtist => artist !== null
      );

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
    const url = `https://itunes.apple.com/lookup?id=${artistId}&entity=album&limit=${limit}&country=KR&lang=ko_kr`;

    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`iTunes API error: ${response.status}`);
    }

    let data = (await response.json()) as iTunesLookupResponse;
    let albums = (data.results || []) as iTunesAlbum[];

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

    const filteredAlbums = albums.filter((album) => {
      const collectionType = album.collectionType?.toLowerCase() || "";
      const trackCount = album.trackCount || 0;
      
      if (collectionType === "single" && trackCount < 5) {
        return false;
      }
      return isValidAlbum(album);
    });

    const uniqueAlbums = new Map<number, iTunesAlbum>();
    const seenCombinations = new Set<string>();
    
    for (const album of filteredAlbums) {
      if (!album.collectionId) continue;
      
      if (uniqueAlbums.has(album.collectionId)) {
        continue;
      }
      
      const combination = `${(album.collectionName || "").toLowerCase().trim()}_${(album.artistName || "").toLowerCase().trim()}`;
      if (seenCombinations.has(combination)) {
        continue;
      }
      
      uniqueAlbums.set(album.collectionId, album);
      seenCombinations.add(combination);
    }

    const albumsList = Array.from(uniqueAlbums.values());

    const albumsWithKoreanTitles = await Promise.all(
      albumsList.map(async (album) => {
        if (/[가-힣]/.test(album.collectionName)) {
          return album;
        }
        
        const koreanTitle = await getKoreanAlbumTitle(album.collectionId);
        if (koreanTitle) {
          return { ...album, collectionName: koreanTitle };
        }
        
        return album;
      })
    );

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
  const url = `https://itunes.apple.com/search?term=${encodedTerm}&media=music&entity=${entity}&limit=${limit}&country=KR&lang=ko_kr`;

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`iTunes API error: ${response.status}`);
  }

  let data = (await response.json()) as iTunesSearchResponse;
  
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
    
    const internalLimit = 100;
    
    let allResults = await searchAlbumsByEntity(
      trimmedTerm,
      "album",
      internalLimit,
      useKoreanParams
    );

    allResults = allResults.filter((album) => {
      const collectionType = album.collectionType?.toLowerCase() || "";
      const trackCount = album.trackCount || 0;

      if (collectionType === "single" && trackCount < 5) {
        return false;
      }
      if (!isValidAlbum(album)) {
        return false;
      }
      return isRelevantToSearch(album, trimmedTerm);
    });

    if (allResults.length < 10) {
      try {
        const trackResults = await searchAlbumsByEntity(
          trimmedTerm,
          "musicTrack",
          Math.min(internalLimit - allResults.length, 30),
          useKoreanParams
        );

        const trackAlbums = trackResults.filter((track) => {
          const collectionType = track.collectionType?.toLowerCase() || "";
          const trackCount = track.trackCount || 0;

          if (!track.collectionId) {
            return false;
          }
          if (collectionType === "single" && trackCount < 5) {
            return false;
          }
          if (!isValidAlbum(track)) {
            return false;
          }
          return isRelevantToSearch(track, trimmedTerm);
        });

        const existingIds = new Set(allResults.map((a) => a.collectionId));
        for (const track of trackAlbums) {
          if (track.collectionId && !existingIds.has(track.collectionId)) {
            allResults.push(track);
            existingIds.add(track.collectionId);
          }
        }
      } catch {
      }
    }

    const uniqueAlbums = new Map<number, iTunesAlbum>();
    for (const album of allResults) {
      if (album.collectionId && !uniqueAlbums.has(album.collectionId)) {
        uniqueAlbums.set(album.collectionId, album);
      }
    }

    let albumsList = Array.from(uniqueAlbums.values());

    if (useKoreanParams && albumsList.length === 0) {
      try {
        const artistSearchUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(trimmedTerm)}&media=music&entity=musicArtist&limit=5&country=KR&lang=ko_kr`;
        const artistResponse = await fetch(artistSearchUrl, {
          headers: {
            Accept: "application/json",
          },
        });

        if (artistResponse.ok) {
          const artistData = (await artistResponse.json()) as iTunesSearchResponse;
          const artists = (artistData.results || []) as iTunesArtist[];

          const matchedArtists = artists.filter((artist) => {
            if (!artist.artistId || !artist.artistName) return false;
            const artistNameLower = artist.artistName.toLowerCase();
            const termLower = trimmedTerm.toLowerCase();
            return artistNameLower.includes(termLower) || termLower.includes(artistNameLower);
          });

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

    const albumsWithKoreanTitles = await Promise.all(
      albumsList.map(async (album) => {
        if (/[가-힣]/.test(album.collectionName)) {
          return album;
        }
        
        const koreanTitle = await getKoreanAlbumTitle(album.collectionId);
        if (koreanTitle) {
          return { ...album, collectionName: koreanTitle };
        }
        
        return album;
      })
    );

    const sortedAlbums = albumsWithKoreanTitles.sort((a, b) => {
      const termLower = trimmedTerm.toLowerCase();
      const aTitle = (a.collectionName || "").toLowerCase();
      const aArtist = (a.artistName || "").toLowerCase();
      const bTitle = (b.collectionName || "").toLowerCase();
      const bArtist = (b.artistName || "").toLowerCase();
      
      const aContainsTerm = aTitle.includes(termLower) || aArtist.includes(termLower) || 
                           termLower.includes(aTitle) || termLower.includes(aArtist);
      const bContainsTerm = bTitle.includes(termLower) || bArtist.includes(termLower) ||
                           termLower.includes(bTitle) || termLower.includes(bArtist);
      
      if (aContainsTerm && !bContainsTerm) return -1;
      if (!aContainsTerm && bContainsTerm) return 1;
      
      if (aContainsTerm && bContainsTerm) {
        const scoreA = calculateRelevanceScore(a, trimmedTerm);
        const scoreB = calculateRelevanceScore(b, trimmedTerm);
        return scoreB - scoreA;
      }
      
      const scoreA = calculateRelevanceScore(a, trimmedTerm);
      const scoreB = calculateRelevanceScore(b, trimmedTerm);
      return scoreB - scoreA;
    });

    return sortedAlbums.slice(0, limit);
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? `앨범 검색 중 오류가 발생했습니다: ${error.message}`
        : "앨범 검색 중 알 수 없는 오류가 발생했습니다."
    );
  }
}

