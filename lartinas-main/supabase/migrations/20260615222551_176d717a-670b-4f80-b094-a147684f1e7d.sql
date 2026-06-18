
-- community_tips: tighten SELECT so NULL-apartment tips require an active tenant (or staff)
DROP POLICY IF EXISTS "Residents read tips" ON public.community_tips;
CREATE POLICY "Residents read tips"
ON public.community_tips
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(),'admin'::app_role)
  OR public.has_role(auth.uid(),'operacao'::app_role)
  OR (
    apartment_id IS NULL
    AND EXISTS (
      SELECT 1 FROM public.contracts c
      WHERE c.tenant_id = auth.uid() AND c.status = 'ativo'
    )
  )
  OR public.user_has_apartment_access(auth.uid(), apartment_id)
);

-- tickets: staff can update tickets (status, assignment, resolution, etc.)
CREATE POLICY "Staff updates tickets"
ON public.tickets
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(),'admin'::app_role)
  OR public.has_role(auth.uid(),'operacao'::app_role)
)
WITH CHECK (
  public.has_role(auth.uid(),'admin'::app_role)
  OR public.has_role(auth.uid(),'operacao'::app_role)
);
