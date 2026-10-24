"use client";
/** 댓글에 붙일 곡 하나 검색 */

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { COMMENT_TRACK_CLASS as trackStyle } from "@/src/components/interaction/comment-detail-styles";
import type { CommentTrackData } from "@/src/components/interaction/comment-types";
import { searchCommentTracksApi } from "@/src/lib/comments/client-api";
import { ARTIST_SEARCH_DEBOUNCE_MS, ARTIST_SEARCH_MIN_CHARS } from "@/src/lib/itunes/search-config";

interface CommentTrackFieldProps {
  track: CommentTrackData | null;
  disabled?: boolean;
  onChange: (track: CommentTrackData | null) => void;
}

export function CommentTrackField({
  track,
  disabled = false,
  onChange,
}: CommentTrackFieldProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<CommentTrackData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [throttled, setThrottled] = useState(false);

  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const query = term.trim();
    if (query.length < ARTIST_SEARCH_MIN_CHARS) {
      setResults([]);
      setThrottled(false);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(() => {
      setIsLoading(true);
      void searchCommentTracksApi(query)
        .then((response) => {
          if (cancelled) return;
          setResults(response.data.tracks ?? []);
          setThrottled(Boolean(response.data.throttled));
        })
        .catch(() => {
          if (!cancelled) {
            setResults([]);
            setThrottled(false);
          }
        })
        .finally(() => {
          if (!cancelled) setIsLoading(false);
        });
    }, ARTIST_SEARCH_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [open, term]);

  function selectTrack(next: CommentTrackData) {
    onChange(next);
    setOpen(false);
    setTerm("");
    setResults([]);
  }

  const queryReady = term.trim().length >= ARTIST_SEARCH_MIN_CHARS;

  return (
    <div ref={rootRef} className={trackStyle.field}>
      <div className={trackStyle.row}>
        <button
          type="button"
          aria-expanded={open}
          disabled={disabled}
          onClick={() => setOpen((previous) => !previous)}
          className={trackStyle.toggle}
        >
          곡
        </button>
        {track ? (
          <div className={trackStyle.chip}>
            <TrackArtwork artworkUrl={track.artworkUrl} />
            <div className="min-w-0 flex-1">
              <p className={trackStyle.title}>{track.trackName}</p>
              <p className={trackStyle.meta}>{track.artistName}</p>
            </div>
            <button
              type="button"
              onClick={() => onChange(null)}
              className={trackStyle.remove}
            >
              빼기
            </button>
          </div>
        ) : null}
      </div>
      {open ? (
        <div className={trackStyle.panel}>
          <input
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.preventDefault();
            }}
            placeholder="곡이나 아티스트를 검색"
            aria-label="추천할 곡 검색"
            className={trackStyle.search}
          />
          {isLoading ? <p className={trackStyle.status}>검색 중...</p> : null}
          {!isLoading && throttled ? (
            <p className={trackStyle.status}>검색이 잠시 제한되었습니다. 잠시 후 다시 시도해주세요.</p>
          ) : null}
          {!isLoading && !throttled && queryReady && results.length === 0 ? (
            <p className={trackStyle.status}>곡을 찾지 못했습니다.</p>
          ) : null}
          <ul>
            {results.map((result) => (
              <li key={result.trackId}>
                <button
                  type="button"
                  onClick={() => selectTrack(result)}
                  className={trackStyle.option}
                >
                  <TrackArtwork artworkUrl={result.artworkUrl} />
                  <span className="min-w-0">
                    <span className={`block ${trackStyle.optionTitle}`}>{result.trackName}</span>
                    <span className={`block ${trackStyle.optionMeta}`}>
                      {result.artistName}
                      {result.collectionName ? ` · ${result.collectionName}` : ""}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function TrackArtwork({ artworkUrl }: { artworkUrl: string | null }) {
  return (
    <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-md bg-[#F3F3F3]">
      {artworkUrl ? (
        <Image src={artworkUrl} alt="" fill sizes="32px" className="object-cover" />
      ) : null}
    </span>
  );
}
