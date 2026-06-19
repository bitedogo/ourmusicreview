ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS show_reviews_public varchar(1) NOT NULL DEFAULT 'Y',
  ADD COLUMN IF NOT EXISTS show_favorites_public varchar(1) NOT NULL DEFAULT 'Y',
  ADD COLUMN IF NOT EXISTS show_masterpieces_public varchar(1) NOT NULL DEFAULT 'Y',
  ADD COLUMN IF NOT EXISTS show_rating_public varchar(1) NOT NULL DEFAULT 'Y';
