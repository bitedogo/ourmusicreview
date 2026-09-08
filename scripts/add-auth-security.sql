CREATE TABLE IF NOT EXISTS public.user_identities (
  id varchar(50) PRIMARY KEY,
  user_id varchar(50) NOT NULL
    REFERENCES public.users(user_id) ON DELETE CASCADE,
  provider varchar(30) NOT NULL,
  provider_subject varchar(255) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_user_identity_provider_subject
    UNIQUE (provider, provider_subject)
);

CREATE INDEX IF NOT EXISTS idx_user_identities_user
  ON public.user_identities(user_id);

CREATE TABLE IF NOT EXISTS public.auth_rate_limits (
  scope varchar(80) NOT NULL,
  key_hash char(64) NOT NULL,
  request_count integer NOT NULL DEFAULT 0,
  window_started_at timestamptz NOT NULL DEFAULT now(),
  blocked_until timestamptz,
  PRIMARY KEY (scope, key_hash)
);

CREATE INDEX IF NOT EXISTS idx_auth_rate_limits_cleanup
  ON public.auth_rate_limits(window_started_at);
