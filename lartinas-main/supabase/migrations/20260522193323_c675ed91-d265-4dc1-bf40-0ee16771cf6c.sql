-- Tighten "Tenant signs own document" policy on contract_documents.
-- Tenants may only flip status from 'enviado' to 'assinado'; they cannot
-- modify content_rendered, title, notes, or other arbitrary fields.

DROP POLICY IF EXISTS "Tenant signs own document" ON public.contract_documents;

CREATE POLICY "Tenant signs own document" ON public.contract_documents
  FOR UPDATE
  USING (
    contract_id IN (SELECT id FROM public.contracts WHERE tenant_id = auth.uid())
    AND status = 'enviado'
  )
  WITH CHECK (
    contract_id IN (SELECT id FROM public.contracts WHERE tenant_id = auth.uid())
    AND status = 'assinado'
  );