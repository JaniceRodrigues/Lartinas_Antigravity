-- 1. Lock down has_role() execution
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- 2. Replace broad public bucket SELECT with per-object reads (no listing)
DROP POLICY IF EXISTS "Public reads apartment photos" ON storage.objects;
DROP POLICY IF EXISTS "Public reads room photos" ON storage.objects;
DROP POLICY IF EXISTS "Public reads profile photos" ON storage.objects;

-- Re-grant read but the linter flags broad SELECT policies on public buckets as listing risk.
-- Files remain accessible via public URL; only listing via API is blocked for non-admins.
CREATE POLICY "Authenticated lists apartment photos" ON storage.objects FOR SELECT
  USING (bucket_id = 'apartment-photos' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'operacao')));
CREATE POLICY "Authenticated lists room photos" ON storage.objects FOR SELECT
  USING (bucket_id = 'room-photos' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'operacao')));
CREATE POLICY "User lists own profile photos" ON storage.objects FOR SELECT
  USING (
    bucket_id = 'profile-photos' AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR public.has_role(auth.uid(), 'admin')
    )
  );

-- 3. Tighten "Anyone can submit application" — remove WITH CHECK (true), require user_id is null OR matches auth.uid()
DROP POLICY IF EXISTS "Anyone can submit application" ON public.applications;
CREATE POLICY "Submit application" ON public.applications FOR INSERT
  WITH CHECK (
    user_id IS NULL OR auth.uid() = user_id
  );