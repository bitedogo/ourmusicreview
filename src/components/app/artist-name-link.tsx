"use client";
/** 아티스트명 → 해당 아티스트 앨범 검색 결과로 이동 */

import type { ButtonHTMLAttributes, MouseEvent } from "react";
import { useArtistSearchNavigation } from "@/src/hooks/use-artist-search-navigation";

export interface ArtistNameLinkProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick" | "type" | "children"> {
  name: string;
  artistId?: string | null;
  /** 부모 Link/a 클릭 방지 (카드 전체가 링크일 때) */
  stopPropagation?: boolean;
}

export function ArtistNameLink({
  name,
  artistId,
  className,
  stopPropagation = true,
  disabled,
  title,
  ...rest
}: ArtistNameLinkProps) {
  const { isNavigating, navigateToArtistAlbums } = useArtistSearchNavigation();
  const trimmed = name.trim();
  if (!trimmed) return null;

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    if (stopPropagation) {
      event.preventDefault();
      event.stopPropagation();
    }
    void navigateToArtistAlbums(trimmed, artistId);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || isNavigating || !trimmed}
      title={title ?? trimmed}
      className={className}
      {...rest}
    >
      {name}
    </button>
  );
}

interface ArtistNamesLinksProps {
  artists: string[];
  className?: string;
  linkClassName?: string;
  stopPropagation?: boolean;
}

/** 여러 아티스트를 ", "로 이어 각각 링크로 표시 */
export function ArtistNamesLinks({
  artists,
  className,
  linkClassName,
  stopPropagation = true,
}: ArtistNamesLinksProps) {
  const names = artists.map((artist) => artist.trim()).filter(Boolean);
  if (names.length === 0) return null;

  return (
    <span className={className}>
      {names.map((artist, index) => (
        <span key={`${artist}-${index}`}>
          {index > 0 ? ", " : null}
          <ArtistNameLink
            name={artist}
            className={linkClassName}
            stopPropagation={stopPropagation}
          />
        </span>
      ))}
    </span>
  );
}
