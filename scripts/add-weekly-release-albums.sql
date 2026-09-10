-- 홈 주간 신보 큐레이션

CREATE TABLE IF NOT EXISTS public.weekly_release_albums (
  id VARCHAR(36) PRIMARY KEY,
  collection_id VARCHAR(50) NOT NULL UNIQUE,
  category VARCHAR(1) NOT NULL,
  title VARCHAR(500) NOT NULL,
  artist VARCHAR(255) NOT NULL,
  artist_id VARCHAR(50) NULL,
  image_url VARCHAR(1000) NULL,
  release_date VARCHAR(10) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT weekly_release_albums_category_check CHECK (category IN ('K', 'I')),
  CONSTRAINT weekly_release_albums_release_date_check CHECK (release_date ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$')
);

CREATE INDEX IF NOT EXISTS idx_weekly_release_albums_date_category
  ON public.weekly_release_albums (release_date, category);
