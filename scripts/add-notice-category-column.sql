-- 공지사항 카테고리 컬럼 추가 (notice_category)
-- 프로젝트 루트에서 실행: psql $DATABASE_URL -f scripts/add-notice-category-column.sql

ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS notice_category VARCHAR(20) NULL;
