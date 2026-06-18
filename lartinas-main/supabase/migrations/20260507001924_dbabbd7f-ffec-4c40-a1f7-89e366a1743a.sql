ALTER TABLE public.owners
  ADD CONSTRAINT owners_profile_id_fkey
  FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;