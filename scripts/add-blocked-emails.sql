/** 강제 탈퇴 이메일 재가입 차단 테이블 */

CREATE TABLE IF NOT EXISTS public.blocked_emails (
  email VARCHAR(255) PRIMARY KEY,
  blocked_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reason TEXT NULL,
  blocked_by_admin_id VARCHAR(50) NULL,
  previous_user_id VARCHAR(50) NULL
);
