/**
 * iTunes Search/Lookup API 연동 모듈.
 * 아티스트 검색, 앨범 목록/상세 조회, 한국·글로벌 결과 병합 등을 제공합니다.
 */

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

const FETCH_OPTIONS = { headers: { Accept: "application/json" as const }, cache: "no-store" as const };

/**
 * 100x100 아트워크 URL을 600x600 고해상도 URL로 변환합니다.
 */
export function getLargeImageUrl(artworkUrl100: string | undefined): string | null {
  if (!artworkUrl100) return null;
  return artworkUrl100.replace(/100x100bb\.jpg$/, "600x600bb.jpg");
}

function isKoreanSearch(term: string): boolean {
  return /[가-힣]/.test(term);
}

function isValidAlbum(album: iTunesAlbum): boolean {
  const title = (album.collectionName || "").toUpperCase();
  const genre = (album.primaryGenreName || "").toUpperCase();
  const titleFilterKeywords = [
    "LEAK", "FANMADE", "TRIBUTE", "COVER", "PARODY", "BOOTLEG", "UNOFFICIAL",
    "FAN MADE", "FAN-MADE", "- SINGLE", " - SINGLE", "INSTRUMENTAL", "REMASTERED",
  ];
  for (const keyword of titleFilterKeywords) {
    if (title.includes(keyword)) return false;
  }
  if (genre === "COMEDY") return false;
  return true;
}

function isArtistRelevantToSearch(artistName: string, searchTerm: string): boolean {
  const termLower = searchTerm.toLowerCase().trim();
  const artistLower = artistName.toLowerCase();
  if (artistLower === termLower || artistLower.includes(termLower)) return true;
  const termWords = termLower.split(/\s+/).filter((w) => w.length > 1);
  if (termWords.length === 0) return true;
  const matchedWords = termWords.filter((word) => artistLower.includes(word)).length;
  return matchedWords >= Math.ceil(termWords.length / 2);
}

/**
 * primary 배열을 우선으로 하고, secondary에서 키가 겹치지 않는 항목만 병합합니다.
 */
function mergeWithPriority<T>(
  primary: T[],
  secondary: T[],
  getKey: (item: T) => string | number
): T[] {
  const keySet = new Set(primary.map(getKey).filter((k) => k !== undefined && k !== ""));
  const fromSecondary = secondary.filter((item) => {
    const key = getKey(item);
    if (key === undefined || key === "") return false;
    if (keySet.has(key)) return false;
    keySet.add(key);
    return true;
  });
  return [...primary, ...fromSecondary];
}

/**
 * KR·글로벌 URL을 동시에 요청하고, 파싱 결과를 primary(KR) 우선으로 병합합니다.
 */
async function fetchHybridData<T>(params: {
  urlKR: string;
  urlGlobal: string;
  parseResponse: (data: unknown) => T[];
  getKey: (item: T) => string | number;
}): Promise<T[]> {
  const { urlKR, urlGlobal, parseResponse, getKey } = params;
  const [responseKR, responseGlobal] = await Promise.all([
    fetch(urlKR, FETCH_OPTIONS),
    fetch(urlGlobal, FETCH_OPTIONS),
  ]);

  let primary: T[] = [];
  try {
    if (responseKR.ok) {
      const data = await responseKR.json();
      primary = parseResponse(data) ?? [];
    }
  } catch {
    primary = [];
  }

  let secondary: T[] = [];
  try {
    if (responseGlobal.ok) {
      const data = await responseGlobal.json();
      secondary = parseResponse(data) ?? [];
    }
  } catch {
    secondary = [];
  }

  return primary.length > 0 || secondary.length > 0
    ? mergeWithPriority(primary, secondary, getKey)
    : primary;
}

async function fetchHybridArtists(urlKR: string, urlGlobal: string): Promise<iTunesArtist[]> {
  return fetchHybridData<iTunesArtist>({
    urlKR,
    urlGlobal,
    parseResponse: (data) => {
      const results = (data as iTunesSearchResponse).results;
      return Array.isArray(results) ? (results as iTunesArtist[]) : [];
    },
    getKey: (a) => a.artistId ?? "",
  });
}

async function fetchHybridAlbums(urlKR: string, urlGlobal: string): Promise<iTunesAlbum[]> {
  return fetchHybridData<iTunesAlbum>({
    urlKR,
    urlGlobal,
    parseResponse: (data) => {
      const results = (data as iTunesLookupResponse).results;
      return Array.isArray(results) ? results : [];
    },
    getKey: (a) => a.collectionId ?? "",
  });
}

function filterAlbumsByTrackRules(albums: iTunesAlbum[]): iTunesAlbum[] {
  return albums.filter((album) => {
    const collectionType = (album.collectionType ?? "").toLowerCase();
    const trackCount = album.trackCount ?? 0;
    if (trackCount < 2) return false;
    if (collectionType === "single" && trackCount < 5) return false;
    return isValidAlbum(album);
  });
}

function dedupeAlbumsByTitleArtist(albums: iTunesAlbum[]): iTunesAlbum[] {
  const seen = new Set<string>();
  return albums.filter((album) => {
    const title = (album.collectionName ?? "").trim();
    const artist = (album.artistName ?? "").trim();
    const key = `${title}_${artist}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function sortAlbumsByReleaseDate(albums: iTunesAlbum[]): iTunesAlbum[] {
  return [...albums].sort((a, b) => {
    const timeA = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
    const timeB = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
    return timeB - timeA;
  });
}

function dedupeArtistsById(artists: iTunesArtist[]): iTunesArtist[] {
  const byId = new Map<number, iTunesArtist>();
  artists.forEach((a) => {
    if (a.artistId && !byId.has(a.artistId)) byId.set(a.artistId, a);
  });
  return Array.from(byId.values());
}

function sortArtistsBySearchRelevance(artists: iTunesArtist[], searchTerm: string): iTunesArtist[] {
  const termLower = searchTerm.toLowerCase().trim();
  const termHasKorean = /[가-힣]/.test(searchTerm);
  return [...artists].sort((a, b) => {
    const aName = a.artistName.toLowerCase();
    const bName = b.artistName.toLowerCase();
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
}

async function getArtistProfileImage(artistId: number): Promise<string | null> {
  try {
    const url = `https://itunes.apple.com/lookup?id=${artistId}&entity=album&limit=1&country=KR&lang=ko_kr`;
    const response = await fetch(url, FETCH_OPTIONS);
    if (!response.ok) return null;
    const data = (await response.json()) as iTunesLookupResponse;
    const albums = data.results ?? [];
    const first = albums[0];
    return first?.artworkUrl100 ? getLargeImageUrl(first.artworkUrl100) : null;
  } catch {
    return null;
  }
}

async function getKoreanAlbumTitle(collectionId: number): Promise<string | null> {
  try {
    const url = `https://itunes.apple.com/lookup?id=${collectionId}&country=KR&lang=ko_kr`;
    const response = await fetch(url, FETCH_OPTIONS);
    if (!response.ok) return null;
    const data = (await response.json()) as iTunesLookupResponse;
    const albums = data.results ?? [];
    const title = albums[0]?.collectionName;
    return title && /[가-힣]/.test(title) ? title : null;
  } catch {
    return null;
  }
}

/**
 * 검색어로 아티스트를 검색합니다. KR·글로벌 결과를 병합하고, 앨범 보유·중복 제거·정렬 후 반환합니다.
 * @param term - 검색어
 * @param limit - 최대 결과 수 (기본 20)
 */
export async function searchArtists(term: string, limit: number = 20): Promise<iTunesArtist[]> {
  if (!term?.trim()) return [];

  const trimmedTerm = term.trim();
  const encodedTerm = encodeURIComponent(trimmedTerm);
  const useKoreanParams = isKoreanSearch(trimmedTerm);

  const urlKR = `https://itunes.apple.com/search?term=${encodedTerm}&media=music&entity=musicArtist&limit=${limit * 2}&country=KR&lang=ko_kr`;
  const urlGlobal = `https://itunes.apple.com/search?term=${encodedTerm}&media=music&entity=musicArtist&limit=${limit * 2}`;

  let artists: iTunesArtist[] = [];
  try {
    artists = await fetchHybridArtists(urlKR, urlGlobal);
  } catch {
    throw new Error("아티스트 검색 중 오류가 발생했습니다.");
  }

  if (artists.length === 0) {
    throw new Error("아티스트 검색 결과가 없습니다.");
  }

  let relevantArtists: iTunesArtist[];
  if (useKoreanParams) {
    relevantArtists = artists.filter((a) => a.artistId && a.artistName);
    if (relevantArtists.length === 0) {
      try {
        const fallbackUrl = `https://itunes.apple.com/search?term=${encodedTerm}&media=music&entity=musicArtist&limit=${limit * 2}&country=KR&lang=ko_kr`;
        const res = await fetch(fallbackUrl, FETCH_OPTIONS);
        if (res.ok) {
          const data = (await res.json()) as iTunesSearchResponse;
          const list = (data.results ?? []) as iTunesArtist[];
          const matched = list.filter((a) => {
            if (!a.artistId || !a.artistName) return false;
            const name = a.artistName.toLowerCase();
            const termL = trimmedTerm.toLowerCase();
            return name.includes(termL) || termL.includes(name);
          });
          if (matched.length > 0) relevantArtists = matched;
        }
      } catch {
        /* fallback failed, keep relevantArtists */
      }
    }
  } else {
    relevantArtists = artists.filter(
      (a) => a.artistId && a.artistName && isArtistRelevantToSearch(a.artistName, trimmedTerm)
    );
  }

  const uniqueArtists = dedupeArtistsById(relevantArtists);
  const sortedArtists = sortArtistsBySearchRelevance(uniqueArtists, trimmedTerm);
  const limitedArtists = sortedArtists.slice(0, limit);

  const artistsWithAlbums = await Promise.all(
    limitedArtists.map(async (artist) => {
      try {
        const albums = await getArtistAlbums(artist.artistId, 50);
        if (!albums?.length) return null;
        if (!artist.artworkUrl100) {
          const profileImage = await getArtistProfileImage(artist.artistId);
          if (profileImage) return { ...artist, artworkUrl100: profileImage };
        }
        return artist;
      } catch {
        return null;
      }
    })
  );

  const filteredArtists = artistsWithAlbums.filter((a): a is iTunesArtist => a !== null);

  if (filteredArtists.length < limit && sortedArtists.length > limit) {
    const additional = sortedArtists.slice(limit, limit * 2);
    const additionalWithAlbums = await Promise.all(
      additional.map(async (artist) => {
        try {
          const albums = await getArtistAlbums(artist.artistId, 50);
          if (!albums?.length) return null;
          if (!artist.artworkUrl100) {
            const profileImage = await getArtistProfileImage(artist.artistId);
            if (profileImage) return { ...artist, artworkUrl100: profileImage };
          }
          return artist;
        } catch {
          return null;
        }
      })
    );
    const needed = limit - filteredArtists.length;
    filteredArtists.push(
      ...additionalWithAlbums.filter((a): a is iTunesArtist => a !== null).slice(0, needed)
    );
  }

  return filteredArtists;
}

/**
 * 아티스트 ID로 앨범 목록을 조회합니다. KR·글로벌 병합, 트랙 규칙 필터, 중복 제거, 한글 제목 보강, 발매일 정렬을 적용합니다.
 * @param artistId - iTunes 아티스트 ID
 * @param limit - 최대 앨범 수 (기본 50)
 */
export async function getArtistAlbums(artistId: number, limit: number = 50): Promise<iTunesAlbum[]> {
  const artistIdNum = Number(artistId);
  if (!Number.isFinite(artistIdNum)) {
    throw new Error("유효하지 않은 아티스트 ID입니다.");
  }

  const urlKR = `https://itunes.apple.com/lookup?id=${artistIdNum}&entity=album&limit=${limit}&country=KR&lang=ko_kr`;
  const urlGlobal = `https://itunes.apple.com/lookup?id=${artistIdNum}&entity=album&limit=${limit}`;

  let albums: iTunesAlbum[] = [];
  try {
    albums = await fetchHybridAlbums(urlKR, urlGlobal);
  } catch {
    throw new Error("앨범 목록 조회 중 오류가 발생했습니다.");
  }

  if (albums.length === 0) {
    throw new Error("앨범 목록을 불러올 수 없습니다.");
  }

  const filtered = filterAlbumsByTrackRules(albums);
  const deduped = dedupeAlbumsByTitleArtist(filtered);

  const withKoreanTitles = await Promise.all(
    deduped.map(async (album) => {
      if (/[가-힣]/.test(album.collectionName ?? "")) return album;
      const koreanTitle = await getKoreanAlbumTitle(album.collectionId);
      return koreanTitle ? { ...album, collectionName: koreanTitle } : album;
    })
  );

  return sortAlbumsByReleaseDate(withKoreanTitles);
}
