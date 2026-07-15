export interface ItunesArtistResult {
  artistId: string;
  artistName: string;
  artistViewUrl?: string;
  artworkUrl100?: string;
  primaryGenreName?: string;
}

export interface ItunesSearchAutocompleteResponse {
  resultCount: number;
  results: ItunesArtistResult[];
}
