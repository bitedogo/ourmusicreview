-- 댓글 대댓글(parent_id) 및 댓글 좋아요(comment_id) 지원

ALTER TABLE public.comments
  ADD COLUMN IF NOT EXISTS parent_id varchar(50) NULL
  REFERENCES public.comments(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments(parent_id);

ALTER TABLE public.likes
  ADD COLUMN IF NOT EXISTS comment_id varchar(50) NULL
  REFERENCES public.comments(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_likes_comment_id ON public.likes(comment_id);
