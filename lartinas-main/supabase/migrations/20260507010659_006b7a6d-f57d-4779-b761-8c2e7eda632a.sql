
-- 1) Restrict tenant updates to contract_documents: only allow flipping status to 'assinado'
--    and setting signed_at/signed_by_ip. Block changes to content, pdf, approval, notes, etc.
CREATE OR REPLACE FUNCTION public.enforce_tenant_document_signing()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Staff bypass
  IF public.has_role(auth.uid(), 'admin'::app_role)
     OR public.has_role(auth.uid(), 'operacao'::app_role) THEN
    RETURN NEW;
  END IF;

  -- For non-staff (tenants), only allow the signing transition
  IF OLD.status = 'enviado' AND NEW.status = 'assinado' THEN
    IF NEW.content_rendered IS DISTINCT FROM OLD.content_rendered
       OR NEW.pdf_path IS DISTINCT FROM OLD.pdf_path
       OR NEW.title IS DISTINCT FROM OLD.title
       OR NEW.kind IS DISTINCT FROM OLD.kind
       OR NEW.template_id IS DISTINCT FROM OLD.template_id
       OR NEW.contract_id IS DISTINCT FROM OLD.contract_id
       OR NEW.approved_by IS DISTINCT FROM OLD.approved_by
       OR NEW.approved_at IS DISTINCT FROM OLD.approved_at
       OR NEW.notes IS DISTINCT FROM OLD.notes
       OR NEW.sent_at IS DISTINCT FROM OLD.sent_at THEN
      RAISE EXCEPTION 'Apenas os campos de assinatura podem ser alterados pelo morador.';
    END IF;
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'Transição de status não permitida para o morador.';
END $$;

DROP TRIGGER IF EXISTS trg_enforce_tenant_document_signing ON public.contract_documents;
CREATE TRIGGER trg_enforce_tenant_document_signing
BEFORE UPDATE ON public.contract_documents
FOR EACH ROW EXECUTE FUNCTION public.enforce_tenant_document_signing();

-- 2) Allow tenants to upload payment proofs into payment-proofs bucket,
--    scoped to a folder named after one of their payment ids.
CREATE POLICY "Tenants upload own payment proofs"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'payment-proofs'
  AND (storage.foldername(name))[1] IN (
    SELECT p.id::text
    FROM public.payments p
    JOIN public.contracts c ON c.id = p.contract_id
    WHERE c.tenant_id = auth.uid()
  )
);

CREATE POLICY "Tenants read own payment proofs"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'payment-proofs'
  AND (storage.foldername(name))[1] IN (
    SELECT p.id::text
    FROM public.payments p
    JOIN public.contracts c ON c.id = p.contract_id
    WHERE c.tenant_id = auth.uid()
  )
);

-- 3) Applications: candidaturas exigem login no app. Tornar user_id NOT NULL
--    para alinhar com a política e evitar registros órfãos.
UPDATE public.applications SET user_id = NULL WHERE false; -- noop; placeholder
ALTER TABLE public.applications ALTER COLUMN user_id SET NOT NULL;
