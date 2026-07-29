ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS show_playlists_public varchar(1) NOT NULL DEFAULT 'Y';
