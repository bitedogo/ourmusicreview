-- 플레이리스트 기능용 테이블 생성

CREATE TABLE IF NOT EXISTS public.playlists (
  id varchar(255) PRIMARY KEY,
  user_id varchar(50) NOT NULL REFERENCES public.users(user_id) ON DELETE CASCADE,
  title varchar(255) NOT NULL,
  description text,
  is_public varchar(1) NOT NULL DEFAULT 'N',
  cover_image_url varchar(1000),
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_playlists_user_id ON public.playlists(user_id);
CREATE INDEX IF NOT EXISTS idx_playlists_user_public ON public.playlists(user_id, is_public);

CREATE TABLE IF NOT EXISTS public.playlist_tracks (
  id varchar(255) PRIMARY KEY,
  playlist_id varchar(255) NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
  track_id varchar(255) NOT NULL,
  track_name varchar(500) NOT NULL,
  artist_name varchar(255) NOT NULL,
  collection_id varchar(255),
  collection_name varchar(500),
  artwork_url_100 varchar(1000),
  preview_url varchar(1000),
  track_number int,
  disc_number int,
  duration_ms int,
  position int NOT NULL DEFAULT 0,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_playlist_tracks_playlist_id ON public.playlist_tracks(playlist_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_playlist_tracks_playlist_track
  ON public.playlist_tracks(playlist_id, track_id);
