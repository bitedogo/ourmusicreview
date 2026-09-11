ALTER TABLE public.albums
  ADD COLUMN IF NOT EXISTS release_type varchar(16) NOT NULL DEFAULT 'album';

UPDATE public.albums
SET release_type = 'single'
WHERE title ILIKE '%- single%';

ALTER TABLE public.albums
  DROP CONSTRAINT IF EXISTS albums_release_type_check;

ALTER TABLE public.albums
  ADD CONSTRAINT albums_release_type_check
  CHECK (release_type IN ('album', 'single'));
