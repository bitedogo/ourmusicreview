import type { AlbumStreamingLinks, StreamingPlatform } from "./types";

export const STREAMING_PLATFORMS: {
  key: StreamingPlatform;
  label: string;
  iconSrc: string;
}[] = [
  {
    key: "appleMusic",
    label: "Apple Music에서 듣기",
    iconSrc: "/streaming/apple-music.png",
  },
  {
    key: "spotify",
    label: "Spotify에서 듣기",
    iconSrc: "/streaming/spotify.png",
  },
  {
    key: "youtubeMusic",
    label: "YouTube Music에서 듣기",
    iconSrc: "/streaming/youtube-music.png",
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
