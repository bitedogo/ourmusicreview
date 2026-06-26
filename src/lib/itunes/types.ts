export interface ItunesTrack {
  trackId: number;
  trackName: string;
  artistId: number;
  artistName: string;
  artistViewUrl: string;
  artworkUrl100: string;
  collectionName: string;
  artworkUrl600: string;
  releaseDate: string;
  primaryGenreName: string;
  trackTimeMillis: number;
}

export interface ItunesSearchResponse {
  resultCount: number;
  results: ItunesTrack[];
}

export interface ItunesArtistResult {
  artistId: number;
  artistName: string;
  artistViewUrl?: string;
  artworkUrl100?: string;
  primaryGenreName?: string;
}

export interface ItunesSearchAutocompleteResponse {
  resultCount: number;
  results: ItunesArtistResult[];
}

export interface MusicInfo {
  trackId: string;
  trackName: string;
  artistId: number;
  artistName: string;
  artistImage: string;
  primaryGenreName?: string;
  albumName: string;
  albumImage: string;
  duration: number;
  releaseDate?: string;
  tracks?: { id: string; title: string; duration: number }[];
}