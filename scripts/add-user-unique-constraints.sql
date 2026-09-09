BEGIN;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.users
    GROUP BY lower(btrim(email))
    HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION
      'users.email 정규화 중복이 있어 고유 인덱스를 생성할 수 없습니다.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.users
    GROUP BY lower(btrim(nickname))
    HAVING count(*) > 1
  ) THEN
    RAISE EXCEPTION
      'users.nickname 정규화 중복이 있어 고유 인덱스를 생성할 수 없습니다.';
  END IF;
END
$$;

CREATE UNIQUE INDEX IF NOT EXISTS uq_users_email_normalized
  ON public.users (lower(btrim(email)));

CREATE UNIQUE INDEX IF NOT EXISTS uq_users_nickname_normalized
  ON public.users (lower(btrim(nickname)));

COMMIT;
