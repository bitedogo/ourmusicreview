"use client";
/** 댓글 목록 */

import { useEffect, useState } from "react";
import { CommentDetailItem } from "@/src/components/interaction/CommentDetailItem";
import { COMMENT_DETAIL_CLASS as styles } from "@/src/components/interaction/comment-detail-styles";
import type { CommentItemData } from "@/src/components/interaction/comment-types";
import { fetchJson } from "@/src/lib/http/client";
import type { AlbumStreamingLinks, BatchStreamingLinksResponse } from "@/src/lib/streaming/types";

interface CommentListProps {
  comments: CommentItemData[];
  isLoading: boolean;
  currentUserId?: string;
  isAdmin?: boolean;
  isLoggedIn: boolean;
  onDelete: (commentId: string) => void;
  onEdit: (
    commentId: string,
    content: string,
    trackId: string | null
  ) => Promise<boolean>;
  onLike: (commentId: string) => void;
  onReply: (
    parentId: string,
    content: string,
    trackId: string | null
  ) => Promise<boolean>;
}

function collectTrackIds(comments: CommentItemData[]): string[] {
  const ids: string[] = [];
  const walk = (items: CommentItemData[]) => {
    for (const item of items) {
      if (item.track?.trackId) ids.push(item.track.trackId);
      walk(item.replies);
    }
  };
  walk(comments);
  return [...new Set(ids)];
}

async function fetchStreamingLinks(trackIds: string[]) {
  const links: Record<string, AlbumStreamingLinks> = {};
  for (let index = 0; index < trackIds.length; index += 50) {
    const slice = trackIds.slice(index, index + 50);
    const response = await fetchJson<BatchStreamingLinksResponse>(
      `/api/tracks/streaming-links?ids=${encodeURIComponent(slice.join(","))}`
    );
    Object.assign(links, response.data.links ?? {});
  }
  return links;
}

export function CommentList({
  comments,
  isLoading,
  currentUserId,
  isAdmin,
  isLoggedIn,
  onDelete,
  onEdit,
  onLike,
  onReply,
}: CommentListProps) {
  const [playingCommentId, setPlayingCommentId] = useState<string | null>(null);
  const [streamingLinksByTrackId, setStreamingLinksByTrackId] = useState<
    Record<string, AlbumStreamingLinks>
  >({});
  const trackIdsKey = collectTrackIds(comments).join(",");

  useEffect(() => {
    let cancelled = false;
    const trackIds = trackIdsKey ? trackIdsKey.split(",") : [];
    if (trackIds.length === 0) {
      setStreamingLinksByTrackId({});
      return;
    }

    void fetchStreamingLinks(trackIds)
      .then((links) => {
        if (!cancelled) setStreamingLinksByTrackId(links);
      })
      .catch(() => {
        if (!cancelled) setStreamingLinksByTrackId({});
      });

    return () => {
      cancelled = true;
    };
  }, [trackIdsKey]);

  if (isLoading) {
    return (
      <div className={styles.listOffset}>
        <p className={styles.empty}>불러오는 중...</p>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className={styles.listOffset}>
        <p className={styles.empty}>첫 번째 댓글을 남겨보세요.</p>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {comments.map((comment) => (
        <CommentDetailItem
          key={comment.id}
          comment={comment}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
          isLoggedIn={isLoggedIn}
          playingCommentId={playingCommentId}
          streamingLinksByTrackId={streamingLinksByTrackId}
          onTogglePlay={(commentId) =>
            setPlayingCommentId((previous) =>
              previous === commentId ? null : commentId
            )
          }
          onStopPlay={(commentId) =>
            setPlayingCommentId((previous) =>
              previous === commentId ? null : previous
            )
          }
          onDelete={onDelete}
          onEdit={onEdit}
          onLike={onLike}
          onReply={onReply}
        />
      ))}
    </div>
  );
}
