-- 장르 계층 + 플레이리스트 N:M 매핑

CREATE TABLE IF NOT EXISTS public.genres (
  id varchar(100) PRIMARY KEY,
  name_ko varchar(100) NOT NULL,
  name_en varchar(100) NOT NULL,
  parent_id varchar(100) REFERENCES public.genres(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_genres_parent_id ON public.genres(parent_id);

CREATE TABLE IF NOT EXISTS public.playlist_genres (
  playlist_id varchar(255) NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
  genre_id varchar(100) NOT NULL REFERENCES public.genres(id) ON DELETE CASCADE,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (playlist_id, genre_id)
);

CREATE INDEX IF NOT EXISTS idx_playlist_genres_genre_id ON public.playlist_genres(genre_id);
CREATE INDEX IF NOT EXISTS idx_playlist_genres_playlist_id ON public.playlist_genres(playlist_id);
