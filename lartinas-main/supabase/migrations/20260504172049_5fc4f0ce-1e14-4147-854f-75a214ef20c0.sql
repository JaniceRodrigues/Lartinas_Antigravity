UPDATE storage.buckets SET public = false WHERE id = 'profile-photos';

-- Allow users to read their own profile photos; admins/staff can read all
DROP POLICY IF EXISTS "profile_photos_owner_read" ON storage.objects;
CREATE POLICY "profile_photos_owner_read" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'profile-photos' AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR public.has_role(auth.uid(), 'admin'::public.app_role)
      OR public.has_role(auth.uid(), 'operacao'::public.app_role)
      OR public.has_role(auth.uid(), 'financeiro'::public.app_role)
    )
  );