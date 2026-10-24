"use client";
/** 댓글에 붙은 추천 곡. 미리듣기와 스트리밍 로고 */

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { COMMENT_TRACK_CLASS as trackStyle } from "@/src/components/interaction/comment-detail-styles";
import type { CommentTrackData } from "@/src/components/interaction/comment-types";
import { StreamingLinkButtons } from "@/src/components/streaming/streaming-link-buttons";
import { fetchCommentTrackApi } from "@/src/lib/comments/client-api";
import type { AlbumStreamingLinks } from "@/src/lib/streaming/types";

interface CommentTrackCardProps {
  track: CommentTrackData;
  isPlaying: boolean;
  streamingLinks?: AlbumStreamingLinks | null;
  onTogglePlay: () => void;
  onStop: () => void;
}

export function CommentTrackCard({
  track,
  isPlaying,
  streamingLinks,
  onTogglePlay,
  onStop,
}: CommentTrackCardProps) {
  const [src, setSrc] = useState(track.previewUrl);
  const [broken, setBroken] = useState(false);
  const triedRefresh = useRef(false);

  useEffect(() => {
    setSrc(track.previewUrl);
    setBroken(false);
    triedRefresh.current = false;
  }, [track.previewUrl, track.trackId]);

  async function handleError() {
    if (triedRefresh.current) {
      setBroken(true);
      onStop();
      return;
    }
    triedRefresh.current = true;
    try {
      const response = await fetchCommentTrackApi(track.trackId);
      const fresh = response.data.track?.previewUrl ?? null;
      if (fresh && fresh !== src) {
        setSrc(fresh);
        return;
      }
    } catch {
      /* 갱신 실패는 안내로 넘긴다 */
    }
    setBroken(true);
    onStop();
  }

  return (
    <div className={trackStyle.inline}>
      <span className={trackStyle.cover}>
        {track.artworkUrl ? (
          <Image src={track.artworkUrl} alt="" fill sizes="22px" className="object-cover" />
        ) : null}
      </span>
      <p className={trackStyle.inlineTitle}>
        {track.collectionId ? (
          <Link
            href={`/review/album/${encodeURIComponent(track.collectionId)}`}
            className="hover:underline"
          >
            {track.trackName}
          </Link>
        ) : (
          track.trackName
        )}
        <span className={trackStyle.inlineArtist}> · {track.artistName}</span>
      </p>
      <div className={trackStyle.inlineActions}>
        {src && !broken ? (
          <button type="button" onClick={onTogglePlay} className={trackStyle.play}>
            {isPlaying ? "정지" : "미리듣기"}
          </button>
        ) : null}
        {broken ? <p className={trackStyle.broken}>재생 불가</p> : null}
        <StreamingLinkButtons links={streamingLinks} size="compact" />
      </div>
      {isPlaying && src ? (
        <audio
          key={src}
          autoPlay
          src={src}
          onEnded={onStop}
          onError={() => {
            void handleError();
          }}
          className="hidden"
        />
      ) : null}
    </div>
  );
}
