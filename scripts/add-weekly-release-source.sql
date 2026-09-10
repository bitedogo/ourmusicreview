-- 신보 출처: iTunes 검색 등록 vs 관리자 직접 등록

ALTER TABLE public.weekly_release_albums
  ADD COLUMN IF NOT EXISTS source VARCHAR(16) NOT NULL DEFAULT 'itunes';

ALTER TABLE public.weekly_release_albums
  DROP CONSTRAINT IF EXISTS weekly_release_albums_source_check;

ALTER TABLE public.weekly_release_albums
  ADD CONSTRAINT weekly_release_albums_source_check
  CHECK (source IN ('itunes', 'manual'));

CREATE INDEX IF NOT EXISTS idx_weekly_release_albums_source_date
  ON public.weekly_release_albums (source, release_date);
