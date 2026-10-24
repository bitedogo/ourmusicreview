-- 댓글당 추천 곡 하나. 음원은 저장하지 않고 iTunes 스냅샷만 둔다.

ALTER TABLE public.comments
  ADD COLUMN IF NOT EXISTS track_id varchar(255) NULL,
  ADD COLUMN IF NOT EXISTS track_name varchar(500) NULL,
  ADD COLUMN IF NOT EXISTS artist_name varchar(255) NULL,
  ADD COLUMN IF NOT EXISTS collection_id varchar(255) NULL,
  ADD COLUMN IF NOT EXISTS collection_name varchar(500) NULL,
  ADD COLUMN IF NOT EXISTS artwork_url varchar(1000) NULL,
  ADD COLUMN IF NOT EXISTS preview_url varchar(1000) NULL;
