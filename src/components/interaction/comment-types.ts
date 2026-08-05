/** 댓글 도메인 타입 */

export interface CommentItemData {
  id: string;
  content: string;
  createdAt: string;
  parentId?: string | null;
  likeCount: number;
  liked: boolean;
  replyCount: number;
  replies: CommentItemData[];
  user: {
    id: string;
    nickname: string;
    profileImage: string | null;
  };
}
