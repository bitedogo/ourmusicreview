-- 리뷰 조회수 컬럼 추가

ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS views int NOT NULL DEFAULT 0;
