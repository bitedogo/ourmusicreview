-- 주간 신보 카탈로그(MusicBrainz) 식별자

ALTER TABLE public.weekly_release_albums
  ADD COLUMN IF NOT EXISTS mbid VARCHAR(36) NULL;

CREATE UNIQUE INDEX IF NOT EXISTS weekly_release_albums_mbid_unique
  ON public.weekly_release_albums (mbid)
  WHERE mbid IS NOT NULL;
