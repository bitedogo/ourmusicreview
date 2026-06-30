export interface AlbumStreamingLinks {
  appleMusic?: string;
  spotify?: string;
  youtubeMusic?: string;
  deezer?: string;
}

export type StreamingPlatform = keyof AlbumStreamingLinks;

export interface BatchStreamingLinksResponse {
  ok: boolean;
  data: {
    links: Record<string, AlbumStreamingLinks>;
  };
  error?: string;
}

export function hasAnyStreamingLink(links: AlbumStreamingLinks | undefined | null): boolean {
  if (!links) return false;
  return Boolean(
    links.appleMusic || links.spotify || links.youtubeMusic || links.deezer
  );
}
