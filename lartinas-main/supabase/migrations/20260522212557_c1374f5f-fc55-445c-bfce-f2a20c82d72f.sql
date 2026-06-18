-- 1) Tickets: restrict reporter UPDATE to safe fields only
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='tickets' AND policyname='Reporter updates own ticket') THEN
    EXECUTE 'DROP POLICY "Reporter updates own ticket" ON public.tickets';
  END IF;
END $$;

CREATE POLICY "Reporter updates own ticket safe fields"
ON public.tickets
FOR UPDATE
USING (reporter_id = auth.uid())
WITH CHECK (
  reporter_id = auth.uid()
  AND reporter_id  = (SELECT reporter_id  FROM public.tickets t WHERE t.id = tickets.id)
  AND status       = (SELECT status       FROM public.tickets t WHERE t.id = tickets.id)
  AND priority     = (SELECT priority     FROM public.tickets t WHERE t.id = tickets.id)
  AND assigned_to  IS NOT DISTINCT FROM (SELECT assigned_to  FROM public.tickets t WHERE t.id = tickets.id)
  AND cost         IS NOT DISTINCT FROM (SELECT cost         FROM public.tickets t WHERE t.id = tickets.id)
  AND owner_approval IS NOT DISTINCT FROM (SELECT owner_approval FROM public.tickets t WHERE t.id = tickets.id)
  AND resolution   IS NOT DISTINCT FROM (SELECT resolution   FROM public.tickets t WHERE t.id = tickets.id)
);

-- 2) Community events: require auth
DROP POLICY IF EXISTS "Residents read events" ON public.community_events;
CREATE POLICY "Residents read events"
ON public.community_events
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND (
    apartment_id IS NULL
    OR EXISTS (SELECT 1 FROM public.contracts c WHERE c.tenant_id = auth.uid() AND c.apartment_id = community_events.apartment_id)
  )
);

-- 3) Community tips: require auth
DROP POLICY IF EXISTS "Residents read tips" ON public.community_tips;
CREATE POLICY "Residents read tips"
ON public.community_tips
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND (
    apartment_id IS NULL
    OR EXISTS (SELECT 1 FROM public.contracts c WHERE c.tenant_id = auth.uid() AND c.apartment_id = community_tips.apartment_id)
  )
);

-- 4) House manual: require auth
DROP POLICY IF EXISTS "Residents read manual" ON public.house_manual_sections;
CREATE POLICY "Residents read manual"
ON public.house_manual_sections
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND (
    apartment_id IS NULL
    OR EXISTS (
      SELECT 1 FROM public.contracts c
      WHERE c.tenant_id = auth.uid()
        AND c.apartment_id = house_manual_sections.apartment_id
        AND c.status = 'ativo'::contract_status
    )
  )
);

-- 5) contract-pdfs storage: allow owners to read PDFs of their contracts
DROP POLICY IF EXISTS "Owner reads own contract pdfs" ON storage.objects;
CREATE POLICY "Owner reads own contract pdfs"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'contract-pdfs'
  AND EXISTS (
    SELECT 1
    FROM public.contracts c
    JOIN public.owners o ON o.id = c.owner_id
    WHERE o.profile_id = auth.uid()
      AND (storage.objects.name LIKE c.id::text || '/%' OR storage.objects.name LIKE '%' || c.id::text || '%')
  )
);
