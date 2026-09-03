-- 1:1 문의·답변

CREATE TABLE IF NOT EXISTS public.inquiries (
  id VARCHAR(24) PRIMARY KEY,
  public_code VARCHAR(20) NOT NULL UNIQUE,
  user_id VARCHAR(50) NOT NULL,
  category VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  contact VARCHAR(40) NULL,
  title VARCHAR(100) NOT NULL,
  body TEXT NOT NULL,
  attachments JSONB NOT NULL DEFAULT '[]'::jsonb,
  status VARCHAR(20) NOT NULL DEFAULT 'WAITING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_inquiries_user_created
  ON public.inquiries (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_inquiries_status_created
  ON public.inquiries (status, created_at DESC);

CREATE TABLE IF NOT EXISTS public.inquiry_replies (
  id VARCHAR(24) PRIMARY KEY,
  inquiry_id VARCHAR(24) NOT NULL REFERENCES public.inquiries(id) ON DELETE CASCADE,
  author_user_id VARCHAR(50) NOT NULL,
  is_admin CHAR(1) NOT NULL DEFAULT 'N',
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_inquiry_replies_inquiry_created
  ON public.inquiry_replies (inquiry_id, created_at ASC);
