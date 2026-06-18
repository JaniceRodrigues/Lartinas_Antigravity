
-- 1. APARTMENTS: restrict public read to authenticated users only
DROP POLICY IF EXISTS "Public reads active apartments" ON public.apartments;
CREATE POLICY "Authenticated reads active apartments"
ON public.apartments
FOR SELECT
TO authenticated
USING (active = true OR public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'operacao'::app_role));

-- 2. ROOMS: restrict public read to authenticated users only
DROP POLICY IF EXISTS "Public reads rooms" ON public.rooms;
CREATE POLICY "Authenticated reads rooms"
ON public.rooms
FOR SELECT
TO authenticated
USING (true);

-- 3. APPLICATIONS: require authentication to submit
DROP POLICY IF EXISTS "Submit application" ON public.applications;
CREATE POLICY "Submit application"
ON public.applications
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- 4. INSPECTIONS: tenants can read inspections tied to their contracts
CREATE POLICY "Tenants read own inspections"
ON public.inspections
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.contracts c
    WHERE c.tenant_id = auth.uid()
      AND (c.id = inspections.contract_id
           OR c.room_id = inspections.room_id
           OR c.apartment_id = inspections.apartment_id)
  )
);

-- 5. STORAGE: ticket-photos UPDATE policy mirroring INSERT (folder ownership)
CREATE POLICY "Reporters update own ticket photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'ticket-photos' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'ticket-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 6. Revoke EXECUTE on internal SECURITY DEFINER trigger helpers
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
