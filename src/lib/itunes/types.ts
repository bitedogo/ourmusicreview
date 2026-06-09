export interface ItunesTrack {
  trackId: number;
  trackName: string;
  artistId: number;
  artistName: string;
  artistViewUrl: string;
  artworkUrl100: string; // 아티스트 이미지 (작은 사이즈)
  collectionName: string; // 앨범명
  artworkUrl600: string; // 앨범 이미지 (중간 사이즈)
  releaseDate: string;
  primaryGenreName: string;
  trackTimeMillis: number; // 밀리초 단위
}

export interface ItunesSearchResponse {
  resultCount: number;
  results: ItunesTrack[];
}

export interface ItunesArtistResult {
  artistId: number;
  artistName: string;
  artistViewUrl: string;
  artworkUrl100?: string; // 아티스트 이미지
  primaryGenreName?: string;
}

export interface ItunesSearchAutocompleteResponse {
  resultCount: number;
  results: ItunesArtistResult[];
}

// 프로젝트에서 사용할 정제된 음악 정보 인터페이스 (iTunes API 응답을 기반으로 하지만, 필요에 따라 확장 가능)
export interface MusicInfo {
  trackId: string;
  trackName: string;
  artistId: number;
  artistName: string;
  artistImage: string; // cover_big 사용
  primaryGenreName?: string;
  albumName: string;
  albumImage: string; // cover_big 사용
  duration: number; // 초 단위
  releaseDate?: string; // 앨범 발매일
  tracks?: { id: string; title: string; duration: number }[]; // 트랙리스트
}