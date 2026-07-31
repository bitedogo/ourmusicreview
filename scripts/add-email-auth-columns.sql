/** users 이메일 인증·비밀번호 재설정 컬럼 */

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(128) NULL,
  ADD COLUMN IF NOT EXISTS email_verification_expires_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(128) NULL,
  ADD COLUMN IF NOT EXISTS password_reset_expires_at TIMESTAMPTZ NULL;

-- 기존 계정은 이미 사용 중이므로 인증 완료로 간주
UPDATE public.users
SET email_verified_at = COALESCE(created_at, NOW())
WHERE email_verified_at IS NULL;

UPDATE public.users
SET email = LOWER(email)
WHERE email <> LOWER(email);

CREATE INDEX IF NOT EXISTS idx_users_email_verification_token
  ON public.users (email_verification_token)
  WHERE email_verification_token IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_users_password_reset_token
  ON public.users (password_reset_token)
  WHERE password_reset_token IS NOT NULL;
