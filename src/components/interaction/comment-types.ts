/** 댓글 도메인 타입 */

export interface CommentItemData {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    nickname: string;
    profileImage: string | null;
  };
}
