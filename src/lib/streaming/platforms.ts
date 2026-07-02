import type { AlbumStreamingLinks, StreamingPlatform } from "./types";

export const STREAMING_PLATFORMS: {
  key: StreamingPlatform;
  label: string;
  iconSrc: string;
}[] = [
  {
    key: "appleMusic",
    label: "Apple Music에서 듣기",
    iconSrc: "/streaming/apple-music.svg",
  },
  {
    key: "spotify",
    label: "Spotify에서 듣기",
    iconSrc: "/streaming/spotify.svg",
  },
  {
    key: "youtubeMusic",
    label: "YouTube Music에서 듣기",
    iconSrc: "/streaming/youtube-music.png",
  },
  {
    key: "deezer",
    label: "Deezer에서 듣기",
    iconSrc: "/streaming/deezer.svg",
  },
];

export function getVisibleStreamingPlatforms(links: AlbumStreamingLinks | undefined | null) {
  if (!links) return [];

  return STREAMING_PLATFORMS.flatMap((platform) => {
    const url = links[platform.key];
    if (!url) return [];
    return [{ ...platform, url }];
  });
}
