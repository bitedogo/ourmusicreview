-- 평점 0.0–10.0 저장을 위해 NUMERIC(2,1) → NUMERIC(3,1)
-- NUMERIC(2,1) 최대값은 9.9라서 10.0 저장 시 "numeric field overflow"로 리뷰 작성이 실패한다.

ALTER TABLE public.reviews
  ALTER COLUMN rating TYPE numeric(3, 1);
