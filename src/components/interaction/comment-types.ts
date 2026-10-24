/** 댓글 도메인 타입 */

export interface CommentTrackData {
  trackId: string;
  trackName: string;
  artistName: string;
  collectionId: string | null;
  collectionName: string | null;
  artworkUrl: string | null;
  previewUrl: string | null;
}

export interface CommentItemData {
  id: string;
  content: string;
  createdAt: string;
  parentId?: string | null;
  likeCount: number;
  liked: boolean;
  replyCount: number;
  replies: CommentItemData[];
  track: CommentTrackData | null;
  user: {
    id: string;
    nickname: string;
    profileImage: string | null;
  };
}
