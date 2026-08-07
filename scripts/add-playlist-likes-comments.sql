-- 플레이리스트 좋아요·댓글 지원 (playlist_id)

ALTER TABLE public.likes
  ADD COLUMN IF NOT EXISTS playlist_id varchar(255) NULL
  REFERENCES public.playlists(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_likes_playlist_id ON public.likes(playlist_id);

ALTER TABLE public.comments
  ADD COLUMN IF NOT EXISTS playlist_id varchar(255) NULL
  REFERENCES public.playlists(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_comments_playlist_id ON public.comments(playlist_id);
