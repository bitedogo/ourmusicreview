-- 사용자 알림 테이블

CREATE TABLE IF NOT EXISTS public.notifications (
  id VARCHAR(24) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  actor_user_id VARCHAR(50) NULL,
  type VARCHAR(40) NOT NULL,
  title VARCHAR(200) NOT NULL,
  body TEXT NULL,
  link VARCHAR(500) NULL,
  is_read CHAR(1) NOT NULL DEFAULT 'N',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_created
  ON public.notifications (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON public.notifications (user_id, is_read, created_at DESC);
