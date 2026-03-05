-- FAQ 테이블 생성 (faqs)
-- 프로젝트 루트에서 실행: psql $DATABASE_URL -f scripts/create-faq-table.sql

CREATE TABLE IF NOT EXISTS public.faqs (
  id VARCHAR(50) PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
