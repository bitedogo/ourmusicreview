BEGIN;

DELETE FROM public.likes
WHERE num_nonnulls(post_id, review_id, comment_id, playlist_id) <> 1;

DELETE FROM public.likes
WHERE id IN (
  SELECT id
  FROM (
    SELECT
      id,
      row_number() OVER (
        PARTITION BY user_id, post_id, review_id, comment_id, playlist_id
        ORDER BY created_at, id
      ) AS duplicate_number
    FROM public.likes
  ) duplicates
  WHERE duplicate_number > 1
);

DELETE FROM public.reports
WHERE num_nonnulls(post_id, review_id) <> 1;

DELETE FROM public.reports
WHERE id IN (
  SELECT id
  FROM (
    SELECT
      id,
      row_number() OVER (
        PARTITION BY user_id, post_id, review_id
        ORDER BY created_at, id
      ) AS duplicate_number
    FROM public.reports
  ) duplicates
  WHERE duplicate_number > 1
);

DELETE FROM public.user_favorite_albums
WHERE id IN (
  SELECT id
  FROM (
    SELECT
      id,
      row_number() OVER (
        PARTITION BY user_id, album_id
        ORDER BY created_at, id
      ) AS duplicate_number
    FROM public.user_favorite_albums
  ) duplicates
  WHERE duplicate_number > 1
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ck_likes_exactly_one_target'
  ) THEN
    ALTER TABLE public.likes
      ADD CONSTRAINT ck_likes_exactly_one_target
      CHECK (num_nonnulls(post_id, review_id, comment_id, playlist_id) = 1);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ck_reports_exactly_one_target'
  ) THEN
    ALTER TABLE public.reports
      ADD CONSTRAINT ck_reports_exactly_one_target
      CHECK (num_nonnulls(post_id, review_id) = 1);
  END IF;
END
$$;

CREATE UNIQUE INDEX IF NOT EXISTS uq_likes_user_post
  ON public.likes(user_id, post_id) WHERE post_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_likes_user_review
  ON public.likes(user_id, review_id) WHERE review_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_likes_user_comment
  ON public.likes(user_id, comment_id) WHERE comment_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_likes_user_playlist
  ON public.likes(user_id, playlist_id) WHERE playlist_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_reports_user_post
  ON public.reports(user_id, post_id) WHERE post_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_reports_user_review
  ON public.reports(user_id, review_id) WHERE review_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_user_favorite_album
  ON public.user_favorite_albums(user_id, album_id);

COMMIT;
