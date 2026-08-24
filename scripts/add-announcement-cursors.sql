-- 공지 인박스 읽음 커서

CREATE TABLE IF NOT EXISTS public.user_announcement_cursors (
  user_id VARCHAR(50) PRIMARY KEY,
  last_seen_at TIMESTAMP NOT NULL
);
