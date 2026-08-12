/** users 계정 상태·제재 + user_sanctions 이력 */

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS account_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  ADD COLUMN IF NOT EXISTS warning_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS suspended_until TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS suspend_reason TEXT NULL;

UPDATE public.users
SET account_status = 'ACTIVE'
WHERE account_status IS NULL OR account_status = '';

CREATE TABLE IF NOT EXISTS public.user_sanctions (
  id VARCHAR(24) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  admin_id VARCHAR(50) NOT NULL,
  action VARCHAR(20) NOT NULL,
  reason TEXT NOT NULL,
  suspended_until TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_sanctions_user_id_created_at
  ON public.user_sanctions (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_users_account_status
  ON public.users (account_status);
